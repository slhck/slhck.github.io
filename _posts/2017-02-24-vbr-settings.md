---
layout: post
title:  "FFmpeg VBR Settings"
date:   2017-02-24 11:31:41 +0100
categories: video
redirect_from: "/video-encoding"
notes: Please let me know if there's anything wrong or if you're missing some values. Thanks to @LordNeckbeard and @evilsoup on Super User for providing additional input on this.
updates:
    - January 2025 – Update libvpx to libvpx-vp9; add AV1 encoders (libaom-av1, libsvtav1); add VideoToolbox encoders (h264_videotoolbox, hevc_videotoolbox, prores_videotoolbox); update ProRes (prores_ks) with quality settings; add aac_at (macOS); clarify native aac VBR is experimental
    - April 2019 – Clarify Opus options
    - March 2019 – Clarify range of AAC; add Opus defaults
    - November 2018 – Remove unsupported encoders
    - August 2017 – Clarification on aac encoder, reorder encoders.
---

There are various FFmpeg encoders that support variable bit rate / constant quality encoding (learn more [about rate control modes]({% link _posts/2017-03-01-rate-control.md %}) here). This gives you a much better overall quality when file size or average bit rate are not constrained (e.g. in a streaming scenario). Variable bit rate is usually achieved by setting `-q:v` (or `-q:a` for audio) instead of `-b:v` (or `-b:a`), which just sets a target bit rate.

The problem is that every encoder uses a different range of values to set the quality—and they're hard to memorize. This is an attempt to summarize the most important ones.

Notes for reading this table:

- Q<sub>min</sub> stands for the setting to be used for achieving lowest quality and Q<sub>max</sub> for highest. These are not just lowest and highest values.
- Q<sub>def</sub> is the default value chosen if no other is specified. This means that (most?) encoders will use one or the other VBR mode by default, e.g. libx264. I wasn't able to research whether this applies to all encoders.
- Some encoders use private options instead of the regular <code>-q</code>. Read the second column *Param* for the correct option to use.

<table class="table table-bordered">
<caption>Video</caption>
<thead>
   <tr>
      <th width="70px">Encoder</th>
      <th width="20px">Param</th>
      <th width="20px">Q<sub>min</sub></th>
      <th width="20px">Q<sub>max</sub></th>
      <th width="20px">Q<sub>def</sub></th>
      <th width="70px">Recommended</th>
      <th width="240px">Notes</th>
   </tr>
 </thead>
 <tbody>
   <tr>
      <td><code>libx264</code></td>
      <td><code>-crf</code></td>
      <td>51</td>
      <td>0</td>
      <td>23</td>
      <td>18–28</td>
      <td><small>Values of &plusmn;6 result in double/half avg. bitrate. 0 is lossless.<br/>
                              Specifying <code>-profile:v</code> lets you adjust coding efficiency. See <a href="http://trac.ffmpeg.org/wiki/Encode/H.264">H.264 Encoding Guide</a>.</small>
      </td>
   </tr>
   <tr>
      <td><code>libx265</code></td>
      <td><code>-crf</code></td>
      <td>51</td>
      <td>0</td>
      <td>28</td>
      <td>24–34</td>
      <td><small>Values of &plusmn;6 result in double/half avg. bitrate. 0 is lossless.<br/>
                              Specifying <code>-profile:v</code> lets you adjust coding efficiency. See <a href="http://trac.ffmpeg.org/wiki/Encode/H.265">H.265 Encoding Guide</a> and <a href="http://x265.readthedocs.org/en/default/cli.html#quality-rate-control-and-rate-distortion-options">x265 docs</a>.</small>
      </td>
   </tr>
   <tr>
      <td><code>libvpx-vp9</code></td>
      <td><code>-crf</code></td>
      <td>63</td>
      <td>0</td>
      <td>31 (1080p)</td>
      <td>15–35</td>
      <td>
        <small>Recommended CRF 31 for 1080p HD. Use <code>-b:v 0</code> for pure CRF mode. Two-pass encoding recommended for best quality. See <a href="https://trac.ffmpeg.org/wiki/Encode/VP9">VP9 Encoding Guide</a>.<br/>
        </small>
      </td>
   </tr>
   <tr>
      <td><code>libaom-av1</code></td>
      <td><code>-crf</code></td>
      <td>63</td>
      <td>0</td>
      <td>n/a</td>
      <td>20–35</td>
      <td><small>0 is lossless. CRF 23 is roughly equivalent to x264 CRF 19. Slower than other encoders but excellent compression. See <a href="https://trac.ffmpeg.org/wiki/Encode/AV1">AV1 Encoding Guide</a>.</small>
      </td>
   </tr>
   <tr>
      <td><code>libsvtav1</code></td>
      <td><code>-crf</code></td>
      <td>63</td>
      <td>0</td>
      <td>35</td>
      <td>20–40</td>
      <td><small>Much faster than libaom-av1 with similar quality. Use <code>-preset</code> (0–13) to control speed/quality tradeoff. See <a href="https://trac.ffmpeg.org/wiki/Encode/AV1">AV1 Encoding Guide</a>.</small>
      </td>
   </tr>
   <tr>
      <td><code>h264_videotoolbox</code></td>
      <td><code>-q:v</code></td>
      <td>1</td>
      <td>100</td>
      <td>n/a</td>
      <td>70–85</td>
      <td><small>macOS hardware encoder. Scale 1–100, with 100 being highest quality. Constant quality only available on Apple Silicon (ffmpeg 4.4+). Also supports <code>-b:v</code> for bitrate mode.</small>
      </td>
   </tr>
   <tr>
      <td><code>hevc_videotoolbox</code></td>
      <td><code>-q:v</code></td>
      <td>1</td>
      <td>100</td>
      <td>n/a</td>
      <td>70–85</td>
      <td><small>macOS hardware HEVC encoder. Scale 1–100, with 100 being highest quality. Constant quality only available on Apple Silicon (ffmpeg 4.4+). Also supports <code>-b:v</code> for bitrate mode.</small>
      </td>
   </tr>
    <tr>
      <td><code>libxvid</code></td>
      <td><code>-q:v</code></td>
      <td>31</td>
      <td>1</td>
      <td>n/a</td>
      <td>3–5</td>
      <td><small>2 is visually lossless. Doubling the value results in half the bitrate. Don't use 1, as it wastes space.<br>No VBR by default—it uses <code>-b:v 200K</code> unless specified otherwise.</small></td>
   </tr>
   <tr>
      <td><code>libtheora</code></td>
      <td><code>-q:v</code></td>
      <td>0</td>
      <td>10</td>
      <td>n/a</td>
      <td>7</td>
      <td><small>No VBR by default—it uses <code>-b:v 200K</code> unless specified otherwise.</small></td>
   </tr>
   <tr>
      <td><code>mpeg1</code>, <code>mpeg2</code>, <code>mpeg4</code>, <code>flv</code>, <code>h263</code>, <code>h263+</code>, <code>msmpeg+</code></td>
      <td><code>-q:v</code></td>
      <td>31</td>
      <td>1</td>
      <td>?</td>
      <td>3–5</td>
      <td><small>2 is visually lossless. Doubling the value results in half the bitrate.<br>
      <code>-q:v</code> works for mpeg4, but haven't tested others.</small></td>
   </tr>
   <tr>
      <td><code>prores_ks</code></td>
      <td><code>-profile:v</code><br><code>-q:v</code></td>
      <td>Profile: 0<br>Quality: 32</td>
      <td>Profile: 5<br>Quality: 0</td>
      <td>Profile: 2<br>Quality: n/a</td>
      <td>Profile: Depends<br>Quality: 9–13</td>
      <td><small>Recommended software ProRes encoder. Profiles: 0=Proxy, 1=LT, 2=Standard, 3=HQ, 4=4444, 5=4444 XQ. Quality controlled via <code>-q:v</code> (0=best, 32=worst), recommended 11. Only encoder supporting 4444/XQ and alpha channels. See <a href="https://trac.ffmpeg.org/wiki/Encode/VFX">VFX Encoding Guide</a>.<br>Note: <code>prores</code> and <code>prores_aw</code> encoders also exist but lack profile and quality controls.</small>
      </td>
   </tr>
   <tr>
      <td><code>prores_videotoolbox</code></td>
      <td><code>-profile:v</code></td>
      <td>0</td>
      <td>5</td>
      <td>auto</td>
      <td>Depends</td>
      <td><small>macOS hardware ProRes encoder. Profiles: 0=Proxy, 1=LT, 2=Standard, 3=HQ, 4=4444, 5=XQ. Profile auto-selected based on input format.</small>
      </td>
   </tr>
</tbody>
</table>
<table class="table table-striped table-bordered table-hover">
<caption>Audio</caption>
<thead>
   <tr>
      <th width="70px">Encoder</th>
      <th width="20px">Param</th>
      <th width="20px">Q<sub>min</sub></th>
      <th width="20px">Q<sub>max</sub></th>
      <th width="20px">Q<sub>def</sub></th>
      <th width="70px">Recommended</th>
      <th width="240px">Notes</th>
   </tr>
 </thead>
 <tbody>
   <tr>
      <td><code>libfdk_aac</code></td>
      <td><code>-vbr</code></td>
      <td>1</td>
      <td>5</td>
      <td>?</td>
      <td>4 (~128kbps)</td>
      <td><small>Highest quality AAC encoder. Not available in standard builds—requires custom compilation with <code>--enable-libfdk-aac --enable-nonfree</code>.</small></td>
   </tr>
   <tr>
      <td><code>libopus</code></td>
      <td><code>-b:a</code></td>
      <td>6–8K (mono)</td>
      <td>–</td>
      <td>96K (for stereo)</td>
      <td>–</td>
      <td><small><code>-vbr on</code> is default, <code>-b:a</code> just sets the target, see <a href="https://ffmpeg.org/ffmpeg-codecs.html#toc-libopus-1">FFmpeg documentation</a>.</small></td>
   </tr>
   <tr>
      <td><code>libvorbis</code></td>
      <td><code>-q:a</code></td>
      <td>0</td>
      <td>10</td>
      <td>3</td>
      <td>4 (~128kbps)</td>
      <td><small>Make sure not to use <code>vorbis</code>, which is the (bad) internal encoder.</small></td>
   </tr>
   <tr>
      <td><code>libmp3lame</code></td>
      <td><code>-q:a</code></td>
      <td>9</td>
      <td>0</td>
      <td>4</td>
      <td>2 (~190kbps)</td>
      <td><small>Corresponds to <code>lame -V</code>. See <a href="http://ffmpeg.org/trac/ffmpeg/wiki/Encoding%20VBR%20(Variable%20Bit%20Rate)%20mp3%20audio">FFmpeg Wiki</a>.</small></td>
   </tr>
   <tr>
      <td><code>aac_at</code></td>
      <td><code>-q:a</code><br><code>-aac_at_mode</code></td>
      <td>n/a</td>
      <td>n/a</td>
      <td>auto</td>
      <td>VBR mode with <code>-q:a</code></td>
      <td><small>macOS AudioToolbox AAC encoder. High quality, supports multiple VBR modes (vbr, cvbr, abr). Use <code>-aac_at_mode vbr</code> with <code>-q:a</code> for quality-based VBR. Generally better quality than native <code>aac</code> encoder.</small></td>
   </tr>
   <tr>
      <td><code>aac</code></td>
      <td><code>-q:a</code></td>
      <td>0.1</td>
      <td>2</td>
      <td>?</td>
      <td>1.3 (~128kbps)</td>
      <td><small>Native FFmpeg AAC encoder (second-best quality). VBR mode via <code>-q:a</code> is "experimental and [likely gives] worse results than CBR" according to FFmpeg Wiki. Ranges from 18 to 190kbps. Prefer <code>libfdk_aac</code> or <code>aac_at</code> (macOS) for better quality.</small></td>
   </tr>
 </tbody>
</table>
