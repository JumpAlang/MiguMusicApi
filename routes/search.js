module.exports = {

  async ['/']({ req, res, request, cheerio, getId, UrlSaver }) {

    const query = { ...req.query };
    query.type = query.type || 'song';
    if (!query.keyword) {
      return res.send({
        result: 500,
        errMsg: '搜啥呢？',
      })
    }

    const { keyword, pageNo = 1, pageSize = 20 } = query;
    const typeMap = {
      song: 2,
      singer: 1,
      album: 4,
      playlist: 6,
      mv: 5,
      lyric: 7,
    };


    const result = await request.send({
      url: 'http://m.music.migu.cn/migu/remoting/scr_search_tag?rows=20&type=6&keyword=%25E5%2591%25A8%25E6%259D%25B0%25E4%25BC%25A6&pgc=1',
      data: {
        keyword,
        pgc: pageNo,
        rows: pageSize,
        type: typeMap[query.type],
      },
    });


    let data = [];
    switch (query.type) {
      case 'lyric':
      case 'song':
        let results = [];
        let ds =  result.musics;
        // async for(let i = 0; i < ds.length; i++){
        //     const singerIds = ds[i].singerId.replace(/\s/g, '').split(',');
        //     const singerNames = ds[i].singerName.replace(/\s/g, '').split(',');
        //     const artists = singerIds.map((id, i) => ({ id, name: singerNames[i] }));
        //     const duration =await getDuration(ds[i].copyrightId);
        //     console.log("duration:"+duration.items[0].length);
        //     // results.push({"duration":duration.items[0].length,"name":ds[i].name,"id":ds[i].id,"cid":ds[i].copyrightId,"mvId":ds[i].mcCopyrightId,"url":ds[i].mp3,"album":{"picUrl":ds[i].cover,"name":ds[i].albumName,"id":ds[i].albumId},"artists":artists});
        //     // console.log(results[i]);
        // }



          for(let i = 0; i < ds.length; i++) {
              // const duration = await request.send(`http://music.migu.cn/v3/api/music/audioPlayer/songs?type=1&copyrightId=${ds[i].copyrightId}`);

              const singerIds = ds[i].singerId.replace(/\s/g, '').split(',');
              const singerNames = ds[i].singerName.replace(/\s/g, '').split(',');
              const artists = singerIds.map((id, i) => ({id, name: singerNames[i]}));
              results.push({
                  // "duration": duration.items.length == 0?"":duration.items[0].length,
                  "name": ds[i].songName,
                  "id": ds[i].id,
                  "cid": ds[i].copyrightId,
                  "mvCid":ds[i].mcCopyrightId,
                  "mvId": ds[i].mvId,
                  "url": ds[i].mp3,
                  "album": {"picUrl": ds[i].cover, "name": ds[i].albumName, "id": ds[i].albumId},
                  "artists": artists
              })
              // new Promise((resolve, reject) => {
              //    resolve(request.send(`http://music.migu.cn/v3/api/music/audioPlayer/songs?type=1&copyrightId=${ds[i].copyrightId}`));
              // }).then(resp => {
              //     console.log(i+"-"+resp);
              //     const singerIds = ds[i].singerId.replace(/\s/g, '').split(',');
              //     const singerNames = ds[i].singerName.replace(/\s/g, '').split(',');
              //     const artists = singerIds.map((id, i) => ({id, name: singerNames[i]}));
              //     // console.log("duration:" + resp.items[0].length);
              //     console.log(resp);
              //     // results.push({
              //     //     "duration": resp.items[0].length,
              //     //     "name": ds[i].name,
              //     //     "id": ds[i].id,
              //     //     "cid": ds[i].copyrightId,
              //     //     "mvId": ds[i].mcCopyrightId,
              //     //     "url": ds[i].mp3,
              //     //     "album": {"picUrl": ds[i].cover, "name": ds[i].albumName, "id": ds[i].albumId},
              //     //     "artists": artists
              //     // })
              //
              // });
          }
        data = results;


        // data = result.musics.map(({ songName, singerId, singerName, albumName, albumId, mp3, cover, id, copyrightId, mvId, mcCopyrightId }) => {
        //   const singerIds = singerId.replace(/\s/g, '').split(',');
        //     const singerNames = singerName.replace(/\s/g, '').split(',');
        //     const artists = singerIds.map((id, i) => ({ id, name: singerNames[i] }));
        //     const getDuration = id => {
        //         return  request.send(`http://music.migu.cn/v3/api/music/audioPlayer/songs?type=1&copyrightId=${id}`);
        //     };
        //     const musicDuration = await  getDuration(copyrightId)
        //     return {
        //         duration : musicDuration.items[0].length,
        //
        //         name: songName,
        //         id,
        //         cid: copyrightId,
        //         mvId,
        //         mvCid: mcCopyrightId,
        //         url: mp3,
        //         album: {
        //             picUrl: cover,
        //             name: albumName,
        //             id: albumId,
        //         },
        //         artists,
        //   }
        // })
        break;
      case 'singer':
        data = result.artists.map(({ title, id, songNum, albumNum, artistPicM }) => ({
          name: title,
          id,
          picUrl: artistPicM,
          songCount: songNum,
          albumCount: albumNum,
        }));
        break;
      case 'album':
        data = result.albums.map(({ albumPicM, singer, songNum, id, publishDate, title }) => ({
          name: title,
          id,
          artists: singer,
          songCount: songNum,
          publishTime: publishDate,
          picUrl: albumPicM,
        }));
        break;
      case 'playlist':
        data = result.songLists.map(({ name, img, id, playNum, musicNum, userName, userId, intro }) => ({
          name,
          id,
          picUrl: img,
          playCount: playNum,
          songCount: musicNum,
          intro,
          creator: {
            name: userName,
            id: userId,
          }
        }));
        break;
      case 'mv':
        data = result.mv.map(({ songName, id, mvCopyrightId, mvId, copyrightId, albumName, albumId, singerName, singerId }) => {
          const singerIds = singerId.replace(/\s/g, '').split(',');
          const singerNames = singerName.replace(/\s/g, '').split(',');
          const artists = singerIds.map((id, i) => ({ id, name: singerNames[i] }));
          return {
            name: songName,
            id,
            mvId,
            cid: copyrightId,
            mvCid: mvCopyrightId,
            album: {
              name: albumName,
              id: albumId,
            },
            artists,
          }
        });
        break;
    }

    res.send({
      result: 100,
      data: {
        list: data,
        total: result.pgt,
      },
    });
  }
};

