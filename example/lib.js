import path from "path";
import fs from "fs-extra";

const { outputFile } = fs;

export async function generatePost({ index, postsPath }) {
    const fileName = `${
        index < 10 ? `0${index}` : index
    }-this-is-a-blog-post.md`;
    const output = `---
title: This is post number ${index}
template: blog/post
created_at: 2021-11-${10 + Math.floor(Math.random() * 10)}
slug: blog/:created_at/:title
cover: https://source.unsplash.com/collection/4324303/800x450?${index}
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

Nunc mattis volutpat sollicitudin. Pellentesque pulvinar, lectus a dictum porta, lorem ante volutpat risus, vel ultrices leo magna a orci. Quisque sit amet metus in urna congue lacinia. Nunc nulla nulla, luctus eget rutrum quis, finibus sed ex. Suspendisse posuere eu erat eget pulvinar. Quisque efficitur, risus id posuere sagittis, odio velit tristique neque, congue faucibus ante lacus ut massa. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

Maecenas condimentum leo nec erat sagittis, vitae ultrices elit efficitur. Nullam in consequat libero. Cras et velit ante. In hac habitasse platea dictumst. Ut placerat sed nisl sed semper. Nam sit amet ipsum non eros vehicula ullamcorper. Morbi a ligula vitae dui ultrices volutpat. Phasellus viverra ornare rhoncus. Mauris eros neque, mollis eget gravida at, vestibulum in dolor. Donec interdum libero et lectus maximus luctus. Sed congue justo sed tortor dapibus blandit. Vestibulum volutpat, erat nec convallis commodo, sem risus euismod quam, sed facilisis nisi erat vel lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

Vivamus aliquet porttitor velit, commodo sodales arcu. Sed feugiat tortor eget sodales facilisis. Proin ante tellus, aliquam quis neque lacinia, volutpat fringilla mi. Nullam quis scelerisque ex. Ut sagittis ornare ultricies. In scelerisque odio sed neque aliquet, eu euismod sem iaculis. Duis sagittis tortor quis erat efficitur volutpat. Suspendisse ut augue sodales, fermentum lorem id, ultrices felis.`;
    return await outputFile(path.join(postsPath, fileName), output);
}