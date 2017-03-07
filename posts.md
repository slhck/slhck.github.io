---
layout: page
title: Posts
permalink: /posts/
redirect_from: "/articles-overview"
---

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

Blog posts from the Super User blog:

* [Video Conversion done right: Codecs and Software](http://blog.superuser.com/2011/11/07/video-conversion-done-right-codecs-and-software/)
* [FFmpeg: The ultimate Video and Audio Manipulation Tool](http://blog.superuser.com/2012/02/24/ffmpeg-the-ultimate-video-and-audio-manipulation-tool/)