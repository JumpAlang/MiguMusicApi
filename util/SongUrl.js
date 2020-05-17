const request = require('./request');
const jsonFile = require('jsonfile');
const CrypotJs = require('crypto-js');
const JsEncrypt = require('node-jsencrypt');

class SongUrlSaver {
  constructor() {
    jsonFile.readFile('data/songUrl.json')
      .then((res) => {
        this.data = res;
      });
  }

  push(id, info) {
    this.data[id] = info;
  }

  get(id) {
    return null;//this.data[id];
  }

  check(id, type, url) {
    return Boolean(this.data[id] && this.data[id][type] === url);
  }

  async query(id, cid,songName="") {
    try {
      const req = new request({});
      // 一套神秘的加密环节！
      const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8asrfSaoOb4je+DSmKdriQJKW
VJ2oDZrs3wi5W67m3LwTB9QVR+cE3XWU21Nx+YBxS0yun8wDcjgQvYt625ZCcgin
2ro/eOkNyUOTBIbuj9CvMnhUYiR61lC1f1IGbrSYYimqBVSjpifVufxtx/I3exRe
ZosTByYp4Xwpb1+WAQIDAQAB
-----END PUBLIC KEY-----`;
      const o = `{"copyrightId":"${cid}","auditionsFlag":0}`;
      const s = new JsEncrypt;
      s.setPublicKey(publicKey);
      const a = 1e3 * Math.random();
      const u = CrypotJs.SHA256(String(a)).toString();
      const c = CrypotJs.lib.Cipher._createHelper(CrypotJs.algo.AES).encrypt(o, u).toString();
      const f = s.encrypt(u);
      let result = await req.send({
        url: 'http://music.migu.cn/v3/api/music/audioPlayer/getPlayInfo',
        data: {
          dataType: 2,
          data: c,
          secKey: f,
        },
        headers: {
          referer: 'http://music.migu.cn/v3/music/player/audio'
        }
      });
        const obj = {};

      if (!result || result.msg !== '成功') {
        if(songName != ""){
            const songRes = await req.send(`http://127.0.0.1:3400/search?pageNo=1&pageSize=1&keyword=${songName}`);
            if (songRes && songRes.data && songRes.data.list && songRes.data.list.length > 0) {
                result = songRes.data.list[0];
                obj["find"]=1;
            }else{
              return {};
            }
        }else{
            return {};
        }
      }
      const sizeMap = {
        bqPlayInfo: '128k',
        hqPlayInfo: '320k',
        sqPlayInfo: 'flac',
      };

      // const picRes = await req.send({
      //       url: `http://music.migu.cn/v3/api/music/audioPlayer/getSongPic?songId=${id}`,
      //       headers: {
      //           referer: 'http://music.migu.cn/v3/music/player/audio'
      //       }
      //   });

      obj.pic = "";//"http:"+picRes.mediumPic;
      obj.bgPic = "";//"http:"+picRes.largePic;
        if(obj["find"] != 1){
            Object.keys(result.data).forEach((k) => {
                if (sizeMap[k] && result.data[k]) {
                    obj[sizeMap[k]] = result.data[k].playUrl;
                }
            });
            if(obj["128k"] == undefined){
                obj["128k"] = result.data.playUrl;

            }
        }else{
            obj["128k"]=result.url
        }



      this.push(id, obj);
      return obj;
    } catch (err) {
      return {};
    }
  }

  write() {
    jsonFile.writeFile('data/songUrl.json', this.data);
  }
}

module.exports = SongUrlSaver;