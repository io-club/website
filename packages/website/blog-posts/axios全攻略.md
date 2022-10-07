---
title: "axios"
author: "Lyra"
---

一开始是打算看视频学习AJAX,可是看来看去发现要么不是录音声噪太大声音太小就是过于涉及后端(我还没学后端啊喂,最后打算看文档,发现效果还不错,就跟据自己的想法增删修补,整出了这个教程,目的还是在以后有所忘记时能看自己改的文档,熟悉起来更快吧

![开摆](https://s3.bmp.ovh/imgs/2022/03/bdd6d239690402e6.webp)






# axios全攻略

## axios 简介

***

Axios 是一个基于 *[promise](https://javascript.info/promise-basics)* 网络请求库，作用于[`node.js`](https://nodejs.org/) 和浏览器中。 它是 *[isomorphic](https://www.lullabot.com/articles/what-is-an-isomorphic-application)* 的(即同一套代码可以运行在浏览器和node.js中)。在服务端它使用原生 node.js `http` 模块, 而在客户端 (浏览端) 则使用 XMLHttpRequests。

它本身具有以下特征：

- 从浏览器中创建 XMLHttpRequest
- 从 node.js 发出 http 请求
- 支持 Promise API
- 拦截请求和响应
- 转换请求和响应数据
- 取消请求
- 自动转换JSON数据
- 客户端支持防止 [CSRF/XSRF](http://baike.baidu.com/link?url=iUceAfgyfJOacUtjPgT4ifaSOxDULAc_MzcLEOTySflAn5iLlHfMGsZMtthBm5sK4y6skrSvJ1HOO2qKtV1ej_)(**跨站请求伪造**)



## 安装

***

使用 npm:

```bash
$ npm install axios
```

使用 bower:

```bash
$ bower install axios
```

使用 yarn:

```bash
$ yarn add axios
```

使用 jsDelivr CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
```

使用 unpkg CDN:

```html
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
```



## 浏览器兼容性

***

| [![Chrome](https://camo.githubusercontent.com/1d440f4ffad2f6a8df0e532493cd225964bc8624cb0956171be0717dc4fbce64/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f6368726f6d652f6368726f6d655f34387834382e706e67)](https://camo.githubusercontent.com/1d440f4ffad2f6a8df0e532493cd225964bc8624cb0956171be0717dc4fbce64/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f6368726f6d652f6368726f6d655f34387834382e706e67) | [![Firefox](https://camo.githubusercontent.com/b2a1e5b90d591dfbf5dfa425c0d60d80aa3590d22ace3408cfb36d935808bb69/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f66697265666f782f66697265666f785f34387834382e706e67)](https://camo.githubusercontent.com/b2a1e5b90d591dfbf5dfa425c0d60d80aa3590d22ace3408cfb36d935808bb69/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f66697265666f782f66697265666f785f34387834382e706e67) | [![Safari](https://camo.githubusercontent.com/8d37441ff74dfc50881abae7596a28677bba4617631eccf2143e9559906a81de/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f7361666172692f7361666172695f34387834382e706e67)](https://camo.githubusercontent.com/8d37441ff74dfc50881abae7596a28677bba4617631eccf2143e9559906a81de/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f7361666172692f7361666172695f34387834382e706e67) | [![Opera](https://camo.githubusercontent.com/8663fa4d6a0533eac6da67e2bbfaee3cc1ee6644454a88b21bf31f8196bb0d2f/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f6f706572612f6f706572615f34387834382e706e67)](https://camo.githubusercontent.com/8663fa4d6a0533eac6da67e2bbfaee3cc1ee6644454a88b21bf31f8196bb0d2f/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f6f706572612f6f706572615f34387834382e706e67) | [![Edge](https://camo.githubusercontent.com/b9d103cc69d7a8dc55248c732a7aeb55c1f79e665c76bf523b431db262f0808d/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f656467652f656467655f34387834382e706e67)](https://camo.githubusercontent.com/b9d103cc69d7a8dc55248c732a7aeb55c1f79e665c76bf523b431db262f0808d/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f656467652f656467655f34387834382e706e67) | [![IE](https://camo.githubusercontent.com/d0739e3928b4c84f6c2cd9902bcc379f18c645ffce6089e2ca2a1ecf7a2965cb/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f617263686976652f696e7465726e65742d6578706c6f7265725f392d31312f696e7465726e65742d6578706c6f7265725f392d31315f34387834382e706e67)](https://camo.githubusercontent.com/d0739e3928b4c84f6c2cd9902bcc379f18c645ffce6089e2ca2a1ecf7a2965cb/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f617263686976652f696e7465726e65742d6578706c6f7265725f392d31312f696e7465726e65742d6578706c6f7265725f392d31315f34387834382e706e67) |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Latest ✔                                                     | Latest ✔                                                     | Latest ✔                                                     | Latest ✔                                                     | Latest ✔                                                     | 11 ✔                                                         |



## 基本用例

***

使用axios的基本用例