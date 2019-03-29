---
layout: post
title:  "FFmpeg VBR Settings"
date:   2017-02-24 11:31:41 +0100
categories: video
redirect_from: "/video-encoding"
notes: Please let me know if there's anything wrong or if you're missing some values. Thanks to @LordNeckbeard and @evilsoup on Super User for providing additional input on this.
updates:
    - March 2019 – Clarify range of AAC; add Opus defaults
    - November 2018 – Remove unsupported encoders
    - August 2017 – Clarification on aac encoder, reorder encoders.
---

There are various FFmpeg encoders that support variable bit rate / constant quality encoding (learn more [about rate control modes]({% link _posts/2017-03-01-rate-control.md %}) here). This gives you a much better overall quality when file size or average bit rate are not constrained (e.g. in a streaming scenario). Variable bit rate is usually achieved by setting `-q:v` (or `-q:a` for audio) instead of `-b:v` (or `-b:a`), which just sets a constant bit rate.

The problem is that every encoder uses a different range of values to set the quality—and they're hard to memorize. This is an attempt to summarize the most important ones.

Notes for reading this table:

- Q<sub>min</sub> stands for the setting to be used for achieving lowest quality and Q<sub>max</sub> for highest. These are not just lowest and highest values.
- Q<sub>def</sub> is the default value chosen if no other is specified. This means that (most?) encoders will use one or the other VBR mode by default, e.g. libx264. I wasn't able to research whether this applies to all encoders.
- Some encoders use private options instead of the regular <code>-q</code>. Read the second column *Param* for the correct option to use.
- Rows highlighted with green refer to encoders that allow you to use VBR. Rows in yellow aren't really VBR or I simply couldn't find out whether they support it. Rows in red mean: No VBR support.

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
   <tr class="success">
      <td>libx264</td>
      <td><code>-crf</code></td>
      <td>51</td>
      <td>0</td>
      <td>23</td>
      <td>18–28</td>
      <td><small>Values of &plusmn;6 result in double/half avg. bitrate. 0 is lossless.<br/>
                              Specifying <code>-profile:v</code> lets you adjust coding efficiency. See <a href="http://trac.ffmpeg.org/wiki/Encode/H.264">H.264 Encoding Guide</a>.</small>
      </td>
   </tr>
   <tr class="success">
      <td>libx265</td>
      <td><code>-crf</code></td>
      <td>51</td>
      <td>0</td>
      <td>28</td>
      <td>24–34</td>
      <td><small>Values of &plusmn;6 result in double/half avg. bitrate. 0 is lossless.<br/>
                              Specifying <code>-profile:v</code> lets you adjust coding efficiency. See <a href="http://trac.ffmpeg.org/wiki/Encode/H.265">H.265 Encoding Guide</a> and <a href="http://x265.readthedocs.org/en/default/cli.html#quality-rate-control-and-rate-distortion-options">x265 docs</a>.</small>
      </td>
   </tr>
   <tr class="success">
      <td>libvpx</td>
      <td><code>-qmin</code><br><code>-qmax</code><br>
        <code>-crf</code><br><code>-b:v</code>
      </td>
      <td>63</td>
      <td>0</td>
      <td>10</td>
      <td><code>-qmin</code>: 0–4<br><code>-qmax</code>: 50–63<br><code>-crf</code>: 30</td>
      <td>
        <small><code>-b:v</code> sets target bitrate, or maximum bitrate when <code>-crf</code> is set (enables CQ mode). See also <a href="http://trac.ffmpeg.org/wiki/Encode/VP9">VP9 Encoding Guide</a>. Setting <code>-maxrate</code> and <code>-bufsize</code> is also possible.<br/>
        </small>
      </td>
   </tr>
    <tr class="success">
      <td>libxvid</td>
      <td><code>-q:v</code></td>
      <td>31</td>
      <td>1</td>
      <td>n/a</td>
      <td>3–5</td>
      <td><small>2 is visually lossless. Doubling the value results in half the bitrate. Don't use 1, as it wastes space.<br>No VBR by default—it uses <code>-b:v 200K</code> unless specified otherwise.</small></td>
   </tr>
   <tr class="success">
      <td>libtheora</td>
      <td><code>-q:v</code></td>
      <td>0</td>
      <td>10</td>
      <td>n/a</td>
      <td>7</td>
      <td><small>No VBR by default—it uses <code>-b:v 200K</code> unless specified otherwise.</small></td>
   </tr>
   <tr class="warning">
      <td>mpeg1, mpeg2, mpeg4, flv, h263, h263+, msmpeg+</td>
      <td><code>-q:v</code></td>
      <td>31</td>
      <td>1</td>
      <td>?</td>
      <td>3–5</td>
      <td><small>2 is visually lossless. Doubling the value results in half the bitrate.<br>
      <code>-q:v</code> works for mpeg4, but haven't tested others.</small></td>
   </tr>
   <tr class="warning">
      <td>prores</td>
      <td><code>-profile:v</code></td>
      <td>0</td>
      <td>3</td>
      <td>2</td>
      <td>Depends</td>
      <td><small>Not VBR. Corresponds to the profiles Proxy, LT, Std, HQ.<br>
                              ProRes might support <code>-q:v</code>?<br>
                              Target bitrates are in the <a href="http://images.apple.com/support/finalcutpro/docs/Apple-ProRes-White-Paper-July-2009.pdf">ProRes Whitepaper</a>.</small>
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
   <tr class="success">
      <td>libfdk_aac</td>
      <td><code>-vbr</code></td>
      <td>1</td>
      <td>5</td>
      <td>?</td>
      <td>4 (~128kbps)</td>
      <td><small>Currently the highest quality encoder.</small></td>
   </tr>
   <tr class="success">
      <td>libopus</td>
      <td><code>-compression_level</code></td>
      <td>0</td>
      <td>10</td>
      <td>10</td>
      <td>?</td>
      <td><small><code>-vbr on</code> is default, see <a href="https://ffmpeg.org/ffmpeg-codecs.html#toc-libopus-1">FFmpeg documentation</a>.</small></td>
   </tr>
   <tr class="success">
      <td>libvorbis</td>
      <td><code>-q:a</code></td>
      <td>0</td>
      <td>10</td>
      <td>3</td>
      <td>4 (~128kbps)</td>
      <td><small>Make sure not to use <code>vorbis</code>, which is the (bad) internal encoder.</small></td>
   </tr>
   <tr class="success">
      <td>libmp3lame</td>
      <td><code>-q:a</code></td>
      <td>9</td>
      <td>0</td>
      <td>4</td>
      <td>2 (~190kbps)</td>
      <td><small>Corresponds to <code>lame -V</code>. See <a href="http://ffmpeg.org/trac/ffmpeg/wiki/Encoding%20VBR%20(Variable%20Bit%20Rate)%20mp3%20audio">FFmpeg Wiki</a>.</small></td>
   </tr>
   <tr class="warning">
      <td>aac</td>
      <td><code>-q:a</code></td>
      <td>0.1</td>
      <td>2</td>
      <td>?</td>
      <td>1.3 (~128kbps)</td>
      <td><small>Is "experimental and [likely gives] worse results than CBR" according to FFmpeg Wiki. Ranges from 18 to 190kbps.</small></td>
   </tr>
 </tbody>
</table>