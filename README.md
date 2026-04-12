  ## 3lc3rilli74.github.io

```
.
├── _data
│   └── navigation.yml # You can edit the top-left nav bar from here.
├── _pages # From here you can add or remove the main pages.
├── _posts # Inside posts by creating a md files you create the posts.
│   └── yyyy-mm-dd-title.md
├── assets
│   └── css
│   └── img
│       └── title/image.png
└── _config.yml # Main file to edit the page.
```
  ## Post template

  I will leave a template post in the ```_posts``` folder. Either way I will leave the template.
```
---
layout: single
title: Title of post
excerpt: "Post preview description."
date: 2020-01-27
classes: wide
header:
  teaser: /assets/images/title_folder/img.png
  teaser_home_page: true
  icon: /assets/images/hackthebox.webp
categories:
  - ctf
  - infosec
tags:
  - websockets
  - crypto
---

To insert an image:
![](/assets/images/title_folder/img.png)

To insert a link to a text:
[examole link](https://example.com)

Headers from largest to smallest:
# Header 1
## Header 2
### Header 3

```

