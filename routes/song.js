module.exports = {
  async ['/']({ req, res, request, UrlSaver, cheerio, getId }) {
    const { cid, id } = req.query;
    if (!id || !cid) {
      return res.send({
        result: 500,
        errMsg: '有参数没传呀小老弟',
      })
    }


    const result = await request.send(`http://music.migu.cn/v3/music/song/${cid}`, { dataType: 'raw' });
      const $ = cheerio.load(result);

      let urlInfo = UrlSaver.get(id);
      if (!urlInfo) {
          urlInfo = await UrlSaver.query(id, cid,$('.info_title').text());
      }
    const artists = [];
    $('.info_singer a').each((i, o) => {
      artists.push({
        id: getId(cheerio(o).attr('href')),
        name: cheerio(o).text()
      })
    });
      // const artists = [];
      // const datas = result.items[0];
      // datas.singers.forEach((val,index)=>{
      //   artists.push({id:val.artistId,name:val.artistName});
      // });
      let duration ;

          const durationItem = await request.send(`http://music.migu.cn/v3/api/music/audioPlayer/songs?type=1&copyrightId=${cid}`);
          duration = durationItem.items.length == 0?"":durationItem.items[0].length;

    res.send({
      result: 100,
      data: {
        duration:duration,
         name: $('.info_title').text(),//datas.songName,
          picUrl:"http:"+$(".img_contain img").attr("data-original"),
        id,
        cid,
        artists,
        album: {
          name: $('.info_about a').text(),//datas.albums[0].albumName,//
          id: getId($('.info_about a').attr('href')),//datas.albums[0].albumId,
        },
        ...urlInfo,
      },
    })
  },

  async ['/url']({ req, res, UrlSaver }) {
    const { cid, id, type, url, needPic = '0',songName="" } = req.query;
    if (!id || !cid) {
      return res.send({
        result: 500,
        errMsg: '有参数没传呀小老弟',
      })
    }

    let saveInfo = UrlSaver.get(id);
    // 如果都能对得上，那就开启强制请求
    if (type && url && UrlSaver.check(id, type, url)) {
      saveInfo = undefined;
    }

    if (saveInfo) {
      if (!Number(needPic)) {
        delete saveInfo.pic;
        delete saveInfo.bgPic;
      }
      return res.send({
        result: 100,
        data: saveInfo,
      });
    }

    const result = await UrlSaver.query(id, cid,songName);

    if (!Number(needPic)) {
      delete result.pic;
      delete result.bgPic;
    }

    return res.send({
      result: 100,
      data: result,
    });
  },

  async ['/url/save']({ res, UrlSaver }) {
    UrlSaver.write();

    res.send({
      result: 100,
      data: '就当成功了吧!'
    })
  },

  async ['/find']({ req, res, request, UrlSaver }) {
    const { keyword } = req.query;
    if (!keyword) {
      return res.send({
        result: 500,
        errMsg: '搜啥呢？',
      })
    }

    const songRes = await request.send(`http://127.0.0.1:3400/search?pageNo=1&pageSize=1&keyword=${keyword}`);
    let songInfo;
    let urlInfo;
    if (songRes && songRes.data && songRes.data.list && songRes.data.list.length > 0) {
      songInfo = songRes.data.list[0];
      const { id, cid } = songInfo;
        const musicDuration = await request.send(`http://music.migu.cn/v3/api/music/audioPlayer/songs?type=1&copyrightId=${cid}`);
        songInfo.duration = musicDuration.items.length == 0?"":musicDuration.items[0].length;
        urlInfo = UrlSaver.get(id);
      if (!urlInfo) {
        urlInfo = await UrlSaver.query(id, cid);
        if(urlInfo["128k"] == undefined){
          urlInfo["128k"] = songInfo.url;
        }
      }
      songInfo = { ...songInfo, ...urlInfo };
    }

    res.send({
      result: 100,
      data: songInfo,
    })

  },
};
