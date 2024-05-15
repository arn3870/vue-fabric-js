# vue-fabric-editor

A plug-in image editor developed based on fabric.js and Vue, which can customize fonts, materials, design templates, right-click menus, and shortcut keys.

- [Preview](https://nihaojob.github.io/vue-fabric-editor/)
- [Gitee preview](https://nihaojob.gitee.io/vue-fabric-editor/#/)

![image](https://user-images.githubusercontent.com/13534626/230828335-0adee0ae-b951-4171-b6ba-d2b9cd44dd6a.png)

## Features

1. Plug-in architecture: Customizable materials, right-click menus, shortcut keys and other functions, easy to expand.
2. Simple and easy to use: It is a graphics editor that is mainly lightweight and concise, rather than a large and comprehensive online PS-like re-design tool.
3. Full-featured: Custom templates, gradients, custom fonts and other functions to meet lightweight image editing scenarios.

## Already have functions

[Function introduction article](https://juejin.cn/post/7222141882515128375) text + animation.

- Import JSON file
- Save as PNG, SVG, JSON file
- Insert SVG and image files
- Horizontal and vertical alignment of multiple elements
- Font template
- Combine/Split combination
- Layer and order adjustments
- Undo/Redo
- Background property settings
- Appearance properties/Font properties/Stroke/Shadow
- Custom font
- Custom template materials
- shortcut key
- right click menu
- Auxiliary line
- ruler
- Picture replacement
- Picture filters
- globalization

## Use

### Startup project

Please install node.js v16 first, then execute the following command:

```
yarn install
yarn serve
```

We have prepared deployment tutorials(https://t.zsxq.com/0drqSuyjY)，for non-web front-end developers to quickly solve your deployment needs. You can contact me for**paid deployment and customized development**。

### Custom materials

Fonts, design templates, title templates, etc. can be customized. All customized materials are saved in the https://github.com/nihaojob/vue-fabric-editor-static Project.

The Pro business version supports material management functions. It can maintain fonts, templates, font style templates, and picture materials in the background. It supports classification search and other functions, and can，**quickly build a picture editor application that suits your business**。

We accumulate high-quality frequently asked questions and best practice documents through paid methods. Welcome to join Planet:

<img src="https://user-images.githubusercontent.com/13534626/231202037-18fe913f-81ab-4cd6-aa87-ada471e27586.png" width="50%" >

## Contribution Guide

The project is committed to creating an out-of-the-box web image editor application, and at the same time precipitating an encapsulation layer between the web image editor application and fabric.js. It is expected that the encapsulation layer will be designed for developers and provide a simpler interface. Allow developers to easily implement image application development.

We are still a long way from our goal. If you are interested in this matter, we sincerely invite you to join us. Together we will accumulate the best practices of fabric.js. You will get benefits including but not limited to the following list. As long as you know how to Simple Git and Javascript syntax will do.

- Be familiar with open source collaboration methods and become a project contributor.
- Vue3 + TS practice, learn and develop at the same time.
- Fabric.js development, learn while developing.
- Get started with unit testing, learn while developing.
- Communicate with numerous fabric.js developers.
- Graphics editor architecture experience.

There is currently a lot of work that needs to be done, such as the construction of English documents, SDK splitting, etc. You are welcome to contact me. I am willing to communicate with you on any issues. WeChat: 13146890191. Looking forward to your issues and PRs.

This is the technical note I posted on the Nuggets community about the editor. There will be more details:

1. [Use fabric.js to quickly develop an image editor](https://juejin.cn/post/7155040639497797645)，
2. [Detailed implementation of fabric.js development image editor](https://juejin.cn/post/7199849226745430076)

Note: If you encounter technical problems, you are expected to use issue discussion. It is more open and transparent. Enough information will make problem solving more efficient. Please refer to the[wisdom of asking questions.](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/main/README-zh_CN.md#%E6%8F%90%E9%97%AE%E7%9A%84%E6%99%BA%E6%85%A7)。

<!-- <img src="https://user-images.githubusercontent.com/13534626/231202488-f35be6bc-617a-412e-831e-b3764466d833.jpeg" width="20%"> -->

## planning

### Possible new features

The first stage

- [x] Zoom
- [x] triangles, arrows, lines
- [x] Copy and paste shortcut keys
- [x] Drag mode, zoom in and out
- [x] Canvas size save
- [x] draw lines
- [] svgIcon Summary
- [x] Title style list template
- [x] Preview

second stage

- [x] Picture replacement
- [x] gradient configuration
- [] Tile background, proportional background
- [] Image cropping
- [x] filter
- [x] stroke strokeDashArray

The third phase

- [] monorepo upgrade in progress
- [x] plug-in
- [x] ruler plugin
- [] Screenshot plugin
- [] filter plug-in
- [x] canvas plugin
- [x] Other tool functions
- [] @fabricEditor SDK package
- [] Develop mobile terminal based on plug-in
- [] Develop other picture applications based on plug-ins
- [] Document construction (Chinese and English)

## Acknowledgments

- [color-gradient-picker-vue3](https://github.com/Qiu-Jun/color-gradient-picker-vue3) A vue3 version of the gradient component, author [Qiu-Jun](https://github.com/Qiu-Jun)。
- Ruler function author[Liu Mingye](https://github.com/liumingye)。
