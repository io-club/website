---
title="程序结构导论"
subtitle="Hello World!"
description="这是一门关于程序结构和组成的导论课程."
publish=true
author="xhe"
avatar="/avatar/xhe.png"
last_modified="2020-11-01 20:14:03"
license="by-nc-sa"
---

## 简介

这门课将会介绍各类程序结构和组成. 目的是理解程序执行逻辑, 增长视野, 主要使用python教授. 因此, 你应该多思考, 总结, 掌握方法, 举一反三, 这才是这门课预期的学习效果.

同时, 课程的推进决定于个人的练习/实验进度, 作业并非强制性的, 可根据自己的时间自由调节, 不过建议一周内完成一节内容.

## 课程目录

[程序结构导论(1): 编程入门](/posts/prog_intro/section1)
[程序结构导论(2): 执行分析](/posts/prog_intro/section2)
[程序结构导论(3): 递归](/posts/prog_intro/section3)

## FAQ

说明一些常见问题:

1 . 画图工具?

本文中所有流图都是使用graphviz的dot语言写成的, 比如第一张框图的源码在[这里](//github.com/xhebox/ioclub/blob/master/src/pages/posts/class/flow_1.dot). 可以自行百度graphviz教程, 或使用其他流程图生成工具. 这里有一个在线查看graphviz代码对应的图片的网站: [webgraphviz](http://www.webgraphviz.com/). 还有很多其他在线查看graphviz代码图片的工具.

2 . c语言教学?

这门课不再教授c语言语法, 转而交给学生自学. c入门建议阅读[菜鸟教程](//www.runoob.com/). c语言额外推荐c和指针, c专家编程, c的陷阱和缺陷, krc等书.

编程离不开实践, 不管是python自己的REPL[^REPL], 还是本站浏览器提供的[pyterm](/pyterm)都是绝佳的实验场地. 务必多多实验. 环境搭建可参考[菜鸟教程](//www.runoob.com/python3/python3-install.html)

[^REPL]: REPL, 即Read Eval Print Loop, 读取-执行-打印循环. 一个可以和你实时交互的编程环境. [python3REPL - 菜鸟教程](//www.runoob.com/python3/python3-interpreter.html)

3 . 宣讲会上说过的在线运行python?

~~我确实有做, 但线上还有点问题, 一周内修复.~~ 已修复, 请点击导航栏的py3终端, 需要下载20M数据包, 请注意.

4 . 课程内容改变?

本页内容是在不断更新的, 具体的改变我会写在[变更日志](#变更日志)这一节.

5 . 我有问题...?

直接在IO CLUB内部群中询问, 或者发在本站[源码](//github.com/xhebox/ioclub)的issue上.

## 变更日志

1. 第一节润色完成, 新增变量小节
2. 第二节内容完成, 已添加
3. 更改练习难度为easy, normal, hard, 调整一二节练习
4. 第二节答案放出
5. 标注需要阅读的菜鸟教程章节
6. 考虑到新生基础过于薄弱, 对本文结构大改, 变更为第一节python语法, 第二节数据流/控制流/内存管理, 第三节递归/树.
7. 每一节独立, 这里只做总集
8. 添加内存管理/二叉树树
