---
title: New Website
---

# 接口文档(/▽＼)
## 更新记录
8.24

-  √ (new)获取个性化推荐杂志(文章id列表)(10条) 在杂志下
- 更新了加入足迹接口，现在回同时更新user下的dictionary字段，供推荐算法使用

8.22

- 好家伙，　刚好一个月
- 昨天修补了一些错误的路由，不过还是建议以你自己的为准，说不准那个有问题
- √ (new)获取文章中所有的被划线句子，以及每个句子的所有评论信息，不包括对单独对文章的评论
- 现在获取评论的接口
- －　获取对文章的评论　ａｒｔｉｃｌｅ
- －　获取对划线句子的评论
- －　获取一篇文章中所有划线句子，及所有划线句子的评论
- √ (new)获取杂志(文章id列表)(20条)

8.21


- 不需要用户自己id的现在都不用传token
- get_userinfo拆成两个, get_userinfo传user_id不用登陆, get_selfinfo不传user_id用登陆
- √ (new)评论别人划线的句子
- 拯救了头像上传获取, 不过文件到底被传到了那个文件夹我看不到就离谱



8.20


- 调整了下排序
- √ (new)插入文章
- √ (new)获取5条被画线的句子



8.19


- (new)获取文章中所有 被划线句子及评论(需要改进)
- √ 获取杂志(文章列表)(20条)
- √ 获取文章(根据id)



## 个人

### √ 登录


1. req



```json
{
    "url":  "https://service-1v7iyl73-1306147581.bj.apigw.tencentcs.com/test/account_login",
    "method": "post",
    "body": {
        "username": "root",
        "password": "000000",
    }
}
```


2. req



```json
{
    "code": 1,
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJpc3N1ZSBieSBjbGFzcyBUb2tlbiIsInN1YiI6InN1YiBmb3IgYWxsIHVzZXIgd2hlbiB0cnlpbmcgdG8gbG9naW4iLCJpYXQiOjE2MjgwNTkyNTIuMjM3NDQ1LCJ1c2VybmFtZSI6InJvb3QyIiwiZXhwIjoxNjI4MDYwODI0LjQwOTg3fQ.RnF99g9FK1psdAorqxtKfpFFhbGxRagXLu3aX2odypc",
    "user_id": 1,
}
```


### √ 注册


1. req



```json
{
    "url":  "https://service-1v7iyl73-1306147581.bj.apigw.tencentcs.com/test/account_register",
    "method": "post",
    "body": {
        "username": "root",
        "password": "000000",
        "email": "xxxxx@xxx.xx",
    }
}
```


2. res



```json
{
    "code": 1,
    "msg": "success",
    "user_id": 1,
}
```


### √ 获取个人资料


1. req



```json
{
    "url":  "https://service-1v7iyl73-1306147581.bj.apigw.tencentcs.com/test/account_get_selfinfo",
    "method": "get",
    "header": {
        "Authorization": "token",
    },
}
```


2. res



```json
{
    "code": 1,
    "userinfo": {
        "avatar": "/test/uploads/avatar_3_9Cv6UijahTEEpx97AY.png",
        "email": "2@qq.com",
        "username": "2"
    }
}
```


### √ 上传头像


1. req



```json
{
    "url":  "https://service-1v7iyl73-1306147581.bj.apigw.tencentcs.com/test/account_upload_avatar",
    "method": "post",
    "header": {
        "Authorization": "token",
    },
    "form": {
        "avatar": "sssss.jpg"
    }
}
```


2. res



```json
{
    "code": 1,
}
```


## 新注册


### 获取分类标签


1. req



```json
{
    "url":  "https://service-1v7iyl73-1306147581.bj.apigw.tencentcs.com/test/account_get_tags",
    "method": "get",
    "header": {
        "Authorization": "token",
    },
    "params": {
        
    }
}
```


2. res



```json
{
    "code": 1,
    "list": [
        {
            "tag_id": 1,
            "tag_name": "sssss",
        },
        {
            "tag_id": 1,
            "tag_name": "sssss",
        },
    ]
}
```


### 标签选择


1. req



```json
{
    "url":  "https://service-1v7iyl73-1306147581.bj.apigw.tencentcs.com/test/account_upload_favorite_tags",
    "method": "post",
    "header": {
        "Authorization": "token",
    },
    "body": {
        "tag_ids": [1, 2, 3, 4],
    }
}
```


2. res



```json
{
    "code": 1,
}
```


## 发现


### √ (new)获取5条被画线的句子


1. req



```json
{
    "url":  "https://service-1v7iyl73-1306147581.bj.apigw.tencentcs.com/test/sentence_get_some_sentence",
    "method": "get",
}
```


2. res



```json
{
    "code": 1,
    "list": [
        {
            "article_id": 1,
            "id": 5,
            "sentence": "文章中的某个句子"
        },
        {
            "article_id": 1,
            "id": 3,
            "sentence": "文章中的某个句子"
        },
        {
            "article_id": 1,
            "id": 7,
            "sentence": "文章中的某个句子"
        }
    ]
}
```


### √ 获取一条划线句子的所有评论


1. req



```json
{
    "url":  "https://service-1v7iyl73-1306147581.bj.apigw.tencentcs.com/test/sentence_get_comment",
    "method": "get",
    "params": {
        "sentence_id": 1,
    }
}
```


2. res



```json
{
    "code": 1,
    "list": [
        {
            "comment": "评论",
            "create_time": "Sat, 14 Aug 2021 15:33:38 GMT",
            "father_id": 1,
            "user_id": 2,
            "username": "1"
        }
    ]
}
```


### √ (new)评论一条被划线句子


1. req



```json
{
    "url":  "https://service-1v7iyl73-1306147581.bj.apigw.tencentcs.com/test/sentence_comment2",
    "method": "post",
    "header": {
        "Authorization": "token",
    },
    "body": {
        "sentence_id": 1,
        "comment": "评论",
    }
}
```


2. res



```json
{
    "code": 1,
}
```


### 


## 文章

### √ 加入待读


1. req



```json
{
    "url":  "https://service-1v7iyl73-1306147581.bj.apigw.tencentcs.com/test/article_toberead",
    "method": "get",
    "header": {
        "Authorization": "token",
    },
    "params": {
        "article_id": 1
    }
}
```


2. res



```json
{
    "code": 1,
}
```


### √ 新建摘记


```json
{
    "url":  "https://service-1v7iyl73-1306147581.bj.apigw.tencentcs.com/test/sentence_excerpt",
    "method": "get",
    "header": {
        "Authorization": "token",
    },
    "body": {
        "article_id": 1,
        "sentence": "摘录的原句",
        "comment": "笔记"
    }
}
```


2. res



```json
{
    "code": 1,
}
```


### √ 加入足迹

1. req

```json
{
    "url":  "https://service-1v7iyl73-1306147581.bj.apigw.tencentcs.com/test/article_history",
    "method": "get",
    "header": {
        "Authorization": "token",
    },
    "params": {
        "article_id": 1
    }
}
```


2. res

```json
{
    "code": 1,
}
```


### √ 加入收藏

1. req

```json
{
    "url":  "https://service-1v7iyl73-1306147581.bj.apigw.tencentcs.com/test/article_favorite",
    "method": "get",
    "header": {
        "Authorization": "token",
    },
    "params": {
        "article_id": 1
    }
}
```


2. res



```json
{
    "code": 1,
}
```

## --- end ---
