# 咪咕MusicApi

本项目是对<https://github.com/jsososo/MiguMusicApi>这个项目的js版本进行了一些修改以更好的满足一起听歌吧<https://github.com/JumpAlang/Jusic-serve>

修改点：
1. 获取歌曲详情增加了返回音乐时长字段
2. 获取歌曲链接时最坏的情况就根据歌名去查询serch接口，提取第一个返回的连接

# 使用
更详细接口使用请移步：<https://github.com/jsososo/MiguMusicApi>
对于所有处理过的返回数据，都会包含 `result`，`100` 表示成功，`500` 表示传参错误，`400` 为 node 捕获的未知异常

## Start

```shell
$ git clone git@github.com:JumpAlang/MiguMusicApi.git

$ npm install

$ npm start
```

项目默认端口为 3400

**在线接口测试网址：[http://api.migu.jsososo.com](http://api.migu.jsososo.com)**

# 参考项目
MiguMusicApi:<https://github.com/jsososo/MiguMusicApi>
