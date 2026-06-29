---
layout: page
title: Posts
permalink: /posts/
redirect_from: "/articles-overview"
---

I occasionally write about video encoding and software development on this blog. Here are the most recent posts:

<div class="category-filter" role="group" aria-label="Filter posts by category">
  <button type="button" class="category-badge is-active" data-category="all">All</button>
  {% assign sorted_categories = site.categories | sort %}
  {% for category in sorted_categories %}
    <button type="button" class="category-badge" data-category="{{ category[0] | slugify }}">{{ category[0] | capitalize }} <span class="category-count">{{ category[1] | size }}</span></button>
  {% endfor %}
  {% assign sorted_tags = site.tags | sort %}
  {% for tag in sorted_tags %}
    <button type="button" class="category-badge" data-category="{{ tag[0] | slugify }}">{{ tag[0] | upcase }} <span class="category-count">{{ tag[1] | size }}</span></button>
  {% endfor %}
</div>

<div class="post-listing">
  {% for post in site.posts %}
    <div class="post-listing-item" data-categories="{% for category in post.categories %}{{ category | slugify }} {% endfor %}{% for tag in post.tags %}{{ tag | slugify }} {% endfor %}">
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

<script>
(function () {
  var filter = document.querySelector('.category-filter');
  if (!filter) return;

  var badges = filter.querySelectorAll('.category-badge');
  var items = document.querySelectorAll('.post-listing .post-listing-item');

  function applyFilter(category) {
    items.forEach(function (item) {
      var cats = (item.getAttribute('data-categories') || '').split(' ');
      var show = category === 'all' || cats.indexOf(category) !== -1;
      item.style.display = show ? '' : 'none';
    });

    badges.forEach(function (badge) {
      var active = badge.getAttribute('data-category') === category;
      badge.classList.toggle('is-active', active);
      badge.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  badges.forEach(function (badge) {
    badge.addEventListener('click', function () {
      var category = badge.getAttribute('data-category');
      applyFilter(category);
      if (category === 'all') {
        history.replaceState(null, '', location.pathname);
      } else {
        history.replaceState(null, '', '#' + category);
      }
    });
  });

  // Allow deep-linking, e.g. /posts/#software
  var initial = location.hash.replace('#', '');
  var hasInitial = initial && filter.querySelector('[data-category="' + initial + '"]');
  applyFilter(hasInitial ? initial : 'all');
})();
</script>
