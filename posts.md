---
layout: page
title: Posts
permalink: /posts/
redirect_from: "/articles-overview"
---

I occasionally write about video encoding and software development on this blog. Here are the most recent posts:

<div class="post-listing">
  {% for post in site.posts %}
    <div class="post-listing-item">
      <div class="post-date">{{ post.date | date: "%b %-d, %Y" }}</div>
      <div class="post-title-link">
        <a href="{{ post.url }}">{{ post.title }}</a>
      </div>
    </div>
  {% endfor %}
</div>

Blog posts from the Super User blog:

* [Video Conversion done right: Codecs and Software](http://blog.superuser.com/2011/11/07/video-conversion-done-right-codecs-and-software/)
* [FFmpeg: The ultimate Video and Audio Manipulation Tool](http://blog.superuser.com/2012/02/24/ffmpeg-the-ultimate-video-and-audio-manipulation-tool/)

Other tutorials:

* [FFmpeg Encoding and Editing Course](/ffmpeg-encoding-course)
