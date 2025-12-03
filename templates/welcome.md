---
title: "Welcome to My Blog"
date: "{{DATE}}"
author: "Blog Author"
category: "General"
excerpt: "Welcome to my blog! This is the first post demonstrating the Markdown to HTML processing capabilities with a beautiful, clean design."
tags: ["welcome", "introduction", "getting-started"]
featuredImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop"
---

# Welcome to My Blog

This is your first blog post! It demonstrates the **Markdown to HTML** processing system with a clean, minimal design.

## Features

This blog system supports:

- **Frontmatter** parsing with gray-matter
- **Reading time** calculation
- **Category** and **tag** organization
- Full **Markdown** syntax support
- **Featured images** for visual appeal
- **Real-time search** functionality
- **Responsive design** for all devices

## Getting Started

To create a new post, simply add a new `.md` file to the `content/posts/` directory with frontmatter at the top.

### Example Structure

```markdown
---
title: "Your Post Title"
date: "2024-12-02"
author: "Your Name"
category: "Category Name"
excerpt: "Brief description"
tags: ["tag1", "tag2"]
featuredImage: "https://example.com/image.jpg"
authorAvatar: "https://example.com/avatar.jpg"
---

Your content here...
```

### Featured Images

Featured images are displayed prominently at the top of each post card. You can:
- Use URLs from services like Unsplash (https://unsplash.com)
- Host your own images in a `public/images` directory
- Use relative paths like `/images/my-post.jpg`

### Author Avatars

You can add an `authorAvatar` field to display a custom avatar. If omitted, a placeholder with the first letter of the author's name will be shown.

## What's Next?

Start writing your own posts and watch them appear in your blog automatically!

Happy blogging!
