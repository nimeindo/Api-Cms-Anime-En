const env = require("dotenv");
env.config()
const MainModels = require('../../../models/V1/MainModels')
const ListAnimeController = require('./ListAnimeController')
const promise = require('request-promise');
const md5 = require('md5');
const dateTime = require('node-datetime');
const moment = require('moment'); // require
const cheerio = require('cheerio');

module.exports = {
    
    StreamingAnime : async function(req, res, next){
        try {
            const startTime = new Date()
            ApiKey = req.header("X-API-KEY")
            const getUser = await MainModels.UserTab.findOne({
                where: {token:ApiKey}
            });
            if(getUser){
                const URLStream = req.header("URL-EPISODE")
                
                if(typeof URLStream !== 'undefined' && URLStream){
                    const scrapStream = module.exports.ScrapStreamAnime(URLStream)
                    scrapStream.then(function(result) {
                        const saveData =  module.exports.SaveDataMysql(result)
                        saveData.then(function(result) {
                        //     console.log(result)
                        //     const endTime = new Date();
                        //     const SpeedTime = (endTime - startTime)/1000; 
                        //     const Timestamp = moment().format()
                        //     const ApiResult = {
                        //         "API_TheMovieRs": {
                        //             "Version": "N.1",
                        //             "Timestamp": Timestamp,
                        //             "NameEnd": "Detail Anime Scrap",
                        //             "Status": "Complete",
                        //             "Message": {
                        //             "Type": "Info",
                        //             "ShortText": "Success",
                        //             "Speed": SpeedTime,
                        //             "Code": 200
                        //             },
                        //             "Body": result
                        //         }
                        //     }
                        //     console.log(ApiResult)
                        //     res.send(ApiResult)
                        })
                    })
                }else{
                    console.log("data kosong")
                }

            }
        }catch(err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    },

    ScrapStreamAnime : function(url){
        try { 
            return new Promise((resolve, reject) => {
                return promise(url).then(function(html){
                    var bodyContainer = cheerio('.container',html).html(),
                        retunData = [],
                        title = '',
                        href = '',
                        slug = '',
                        srcVideo = '',
                        create_dateate = dateTime.create(),
                        date_time = create_dateate.format('Y-m-d H:M:S');
                    cheerio('.vmn-video',bodyContainer).each(function(){
                        // get content scrip html and convert to String
                        srcVideo = cheerio(this).html();
                        srcVideo = srcVideo.toString();
                    })
                    // find file src for video frame and filtering data
                    srcVideo = srcVideo.match(/var file = (.*);/).toString()
                    srcVideo= srcVideo.substring(0, srcVideo.indexOf('";'));
                    srcVideo = srcVideo.substring(srcVideo.indexOf('"') + 1);
                    // end
                    cheerio('.vmn-title',bodyContainer).each(function(){
                        title = cheerio(this).find('h1').text();
                    })
                    cheerio('.sd-nav',bodyContainer).each(function(){
                        href = cheerio(this).find('a').attr('href');
                        slug = href.substring(href.indexOf('h/') + 2);
                        slug = slug.replace("/episode/", "-");
                        slug = slug.substring(0, slug.indexOf('/'));
                    })

                    retunData.push({ 
                        title : title,
                        slug : slug,
                        code : md5(slug),
                        href_episode : href,
                        iframe_src : srcVideo,
                        cron_at : date_time
                    })

                    resolve(retunData)
                })
                .catch(function(err){
                    console.log(err)
                    reject(err)
                });
            })
            
        }catch(err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    },

    SaveDataMysql : function(data) {
        try {
            var dataList = [];
            var LogSave = [];
            return new Promise((resolve, reject) => {
                data.forEach(async (element, index, array) => {
                    const getEpisd = await MainModels.listEpslTab.findOne({
                        where: {slug:element.slug}
                    });
                    if(getEpisd){
                        const getStreaming = await MainModels.streamTab.findOne({
                            where: {slug:element.slug}
                        });
                        if(getStreaming){

                        }else{
                            
                        }
                    }else{
                        console.log("data streming tidak di temukan di tabel episode");
                    }
                });
            });
        }catch(err) {
        }
    },

    SaveStreaming: async function(element){
        try{
            const getEpisd = await MainModels.listEpslTab.findOne({
                where: {slug:element.slug}
            });
            const StremingSave = new MainModels.streamTab({
                id_list_anime : getEpisd.id_list_anime,
                id_detail_anime : getEpisd.id_detail_anime,
                id_list_episode : getEpisd.id,
                slug : element.slug,
                code : element.code,
                title : element.title,
                href_episode : element.href_episode,
                next_episode : '',
                prev_episode : '',
                cron_at : element.cron_at,
            })
            await StremingSave.save();
            const LogSave = {
                "hit_date": element.cron_at,
                "slug":element.slug,
                "status": "Success",
                "message":"Streaming Data Save"
            }
            console.log(LogSave)
            return LogSave
            
        }catch(err){
            LogErr = {
                "ErrorCount" : 1,
                "Status": "Not Complete",
                "Message": err.message
            }
            console.log(LogErr)
            return LogErr
        }
    },
    UpdateStreaming: async function(element){
        try{
            const getStreaming = await MainModels.streamTab.findOne({
                where: {slug:element.slug}
            });
            const updateStreaming =  await MainModels.streamTab.update({
                id_list_anime : getStreaming.id_list_anime,
                id_detail_anime : getStreaming.id_detail_anime,
                id_list_episode : getStreaming.id_list_episode,
                slug : element.slug,
                code : element.code,
                title : element.title,
                href_episode : element.href_episode,
                next_episode : '',
                prev_episode : '',
                cron_at : element.cron_at,
            },
            {
                where: {id:getStreaming.id}
            })
            await updateStreaming;
            const LogSave = {
                "hit_date": element.cron_at,
                "slug":element.slug,
                "status": "Success",
                "message":"Streaming Data Save"
            }
            console.log(LogSave)
            return LogSave
            
        }catch(err){
            LogErr = {
                "ErrorCount" : 1,
                "Status": "Not Complete",
                "Message": err.message
            }
            console.log(LogErr)
            return LogErr
        }
    },
}