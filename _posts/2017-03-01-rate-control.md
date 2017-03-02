---
layout: post
title:  "Understanding Rate Control Modes (x264, x265)"
date:   2017-03-01 12:00:00 +0100
categories: video
---

What is "rate control"? It's what a video encoder does when it decides how many bits to spend for a given frame. The goal of (lossy) video encoding is to save as many bits as possible, reducing the file size over the original input file, while retaining as much quality as possible. Rate control is a crucial step in determining that tradeoff between size and quality.

Rate control comes in many forms—you'll recognize the terms "1-pass" and "2-pass", "CBR" and "VBR", maybe you know about "VBV Encoding" or ["CRF"](/articles/crf).

Why should you care? Often enough, you see examples of video encoding commands that apply the wrong kind of rate control mode or wrong bitrates. This post is a brief guide on the different modes; it explains when you'd use which, as an end user. Note that this is not about the nitty-gritty details of Rate-Distortion Optimization.

## Preamble: VBR vs. CBR

Many people are more familiar with rate control in audio encoders, especially those who—like me—grew up with MP3s. To rip our CDs, we had been using Constant Bitrate (CBR) encoding for a while, when later, Variable Bitrate (VBR) encoding came along. Variable bitrate ensured that you'd achieve the lowest possible file size at the highest possible quality under the given constraints (as set by the VBR quality level).

Simply put, VBR lets the encoder use more bits for "stuff that is hard to encode" and save bits for the parts of the file that are easy to compress. What is hard and easy in terms of compression? Lots of motion in a video for example require more bits to encode, since the differences between adjacent video frames will be larger. High spatial details and complex textures are also hard to encode.

## What is your encoding scenario?

Choosing a rate control mode strongly depends on your use case. In general, there are a number of different scenarios that all impact the way you should design your encoding pipeline:

1. **Archival** — You want to compress a file for storing it in your archive, for example on an external hard drive or on your network storage. The file should have the best possible quality at the lowest possible file size, but you don't care about the exact size.
2. **Streaming** — You want to send a file over the Internet, using typical streaming solutions such as HTTP progressive download or HTTP Adaptive Streaming. You need to make sure that the file doesn't exceed a certain bitrate.
3. **Live Streaming** — Like 2., but you want the encoding to be done as fast as possible.
4. **Encoding for Devices** — You want to put your file on a DVD, a Blu-ray, et cetera. You want to ensure that the file ends up having a certain size.

Knowing the scenario helps you choose a rate control mode.

------

## Rate Control Modes

Now, let's dive into the different modes. I will be basing my post on the modes supported by the popular H.264 and H.265 encoders [x264](http://www.videolan.org/developers/x264.html) and [x265](http://x265.org/), as linked in [`ffmpeg`](http://ffmpeg.org/). You can find more information on the options supported by the encoders in [the documentation](http://ffmpeg.org/ffmpeg-all.html#libx264_002c-libx264rgb).

A word of caution: Encoders like x264 do not unnecessarily "stuff" frames with bits. This means that if you have a scene that is very easy to encode, your bitrate may always end up lower than the one you specified. Don't worry about this—just keep in mind that there's no point in achieving an *exact* target bitrate if it's wasteful.

### Constant QP (CQP)

The _Quantization Parameter_ controls the amount of compression for every Macroblock in a frame. Large values mean that there will be higher quantization, more compression, and lower quality. Lower values mean the opposite. QP ranges from 0 to 51 in H.264, and you can easily set a fixed QP for your entire encoding process:

    ffmpeg -i <input> -c:v libx264 -qp 23 <output>

To know more about the idea behind QP, you can read [this tutorial](https://www.vcodex.com/h264avc-4x4-transform-and-quantization/) (if you're not afraid of some maths).

Unless you know what you're doing and you explicitly want this, <span style="color:#f33">do not use this mode!</span>. Setting a fixed QP means that the resulting bitrate will be somewhat constant (unless a scene is very easy to encode), but it will not be efficient for your input video. You may waste space, you have no control of the actual bitrate, and in the worst case, the quality will be bad.

**Good for:** Video encoding research  
**Bad for:** Almost anything else

### Average Bitrate (ABR)

Here, we give the encoder a target bitrate and expect it to figure out how to reach that bitrate:

    ffmpeg -i <input> -c:v libx264 -b:v 1M <output>

<span style="color:#f33">Do not use this mode!</span> The x264 developer himself [says you should never use it](https://mailman.videolan.org/pipermail/x264-devel/2010-February/006934.html). Why? As the encoder doesn't know exactly what's ahead in time, it will have to guess how to reach that bitrate. This means that the rate itself will vary, especially at the beginning of the clip, and at some point reach the target.

While this is technically a VBR mode, it's not much better than specifying a constant bitrate, in that it doesn't reliably deliver good quality.

**Good for:** I can't think of anything  
**Bad for:** Almost anything

### 2-Pass Variable Bitrate (2-Pass VBR)

Allowing the encoder to do two passes (or more) makes it possible for it to estimate what's ahead in time. It can calculate the cost of encoding a frame in the first pass and then, in the second pass, more efficiently use the bits available. This ensures that the output quality is the best under a certain bitrate constraint.

    ffmpeg -i <input> -c:v libx264 -b:v 1M -pass 1 -f mp4 /dev/null
    ffmpeg -i <input> -c:v libx264 -b:v 1M -pass 2 <output>

This is the easiest way to encode a file for streaming, with two caveats: You don't know what the resulting quality will be, so you will have to do some tests to make sure that your bitrate is actually high enough for some complex contents. Also, there may be local spikes in bitrate, meaning you may send more than your client can receive.

**Good for:** Reaching a certain target bitrate; encoding for devices  
**Bad for:** If you need quick encoding (e.g., live streaming)

### Constant Quality (CQ) / Constant Rate Factor (CRF)

I've talked about the [Constant Rate Factor](/articles/crf) in another article in more detail. It basically gives you constant quality throughout your encoding process. It's a "set and forget" thing—just specify the CRF and let the encoder do the rest.

    ffmpeg -i <input> -c:v libx264 -crf 23 <output>

CRF ranges from 0 to 51 (like the QP), and 23 is a good default. 18 should be visually transparent; anything lower will probably just waste file size. Values of ±6 will result in about half or twice the original bitrate. The only downside with this mode is that you don't know what the resulting file size will be.

**Good for:** Archival; achieving the best possible quality  
**Bad for:** Streaming; obtaining a certain bitrate / file size

### Constrained Encoding (VBV)

The [_Video Buffering Verifier_](https://en.wikipedia.org/wiki/Video_buffering_verifier) provides a way to ensure that the bitrate is constrained to a certain maximum. This is useful for streaming, as you can now be certain that you won't send more bits than you promised. VBV can be used both with 2-pass VBR (use it in both passes), or with CRF encoding—it's not an extra rate control mode, to be precise.

Turn on VBV with the `-maxrate` and `-bufsize` options to set the maximum bitrate and the expected client buffer size. A good default is to have the buffer size be twice as large as the maximum rate:

    ffmpeg -i <input> -c:v libx264 -crf 23 -maxrate 1M -bufsize 2M <output>

Or, with two-pass encoding:

    ffmpeg -i <input> -c:v libx264 -b:v 1M -maxrate 1M -bufsize 2M -pass 1 -f mp4 /dev/null
    ffmpeg -i <input> -c:v libx264 -b:v 1M -maxrate 1M -bufsize 2M -pass 2 <output>

When you apply VBV to CRF encoding, the trick is to find a CRF value that, on average, results in your desired maximum bitrate, but not more. If your encode always "maxes out" your maximum bitrate, your CRF was probably set too low. In such a case the encoder tries to spend bits it doesn't have. On the other hand, if you have a high CRF that makes the bitrate not always hit the maximum, you could still lower it to gain some quality.

For example, you encode at CRF 18 *without* VBV. Your clip ends up with an average bitrate of 3.0 MBit/s. But your want your VBV setting to cap the clip at 1.5 MBit/s, so you need to lower your CRF to about 24 to only get half the bitrate.

**Good for:** Streaming under bandwith constraints; live streaming (with CRF, 1-pass); VoD streaming (with target bitrate, 2-pass)  
**Bad for:** People who want to play around; archival

------

## Wrap-Up

Confused yet? I feel you. Making sense of the different rate control modes isn't easy. Unfortunately, the most simple solution (just specifying bitrate) is one that isn't recommended at all, but the Web keeps propagating code examples using this method.

To summarize, here's what you should do, depending on your use case:

1. **Archival** — CRF that gives you the quality you want.
2. **Streaming** — Two-pass encode with VBV-constained bitrate.
3. **Live Streaming** — One-pass encode with VBV-constained bitrate.
4. **Encoding for Devices** — Two-pass encode.

------

Some more reading material:

* [Handbrake Wiki: Constant Quality vs Average Bit Rate](https://handbrake.fr/docs/en/latest/technical/video-cq-vs-abr.html)
* [FFmpeg H.264 Encoding Guide](http://trac.ffmpeg.org/wiki/Encode/H.264)
* [x264-devel Mailing List: Making sense out of x264 rate control modes](https://mailman.videolan.org/pipermail/x264-devel/2010-February/006933.html)