
const env = require("dotenv");
env.config()
const MainModels = require('../../models/V1/MainModels')
const promise = require('request-promise');
const md5 = require('md5');
const dateTime = require('node-datetime');
const moment = require('moment'); // require
const cheerio = require('cheerio');
const url = process.env.URL_LIST

module.exports = {
    // cara 2
    ListAnime : async function(req, res, next){
        try {
            const startTime = new Date()
            ApiKey = req.header("X-API-KEY")
            const getUser = await MainModels.UserTab.findOne({
                where: {token:ApiKey}
            });
            if(getUser){
                const scrapList = module.exports.ScrapListAnime()
                scrapList.then(function(result) {
                    const saveData =  module.exports.updateMysql(result)
                    saveData.then(function(result) {
                        console.log(result)
                        const endTime = new Date();
                        const SpeedTime = (endTime - startTime)/1000; 
                        const Timestamp = moment().format()
                        const ApiResult = {
                            "API_TheMovieRs": {
                                "Version": "N.1",
                                "Timestamp": Timestamp,
                                "NameEnd": "List Anime Scrap",
                                "Status": "Complete",
                                "Message": {
                                  "Type": "Info",
                                  "ShortText": "Success",
                                  "Speed": SpeedTime,
                                  "Code": 200
                                },
                                "Body": result
                            }
                        }
                        console.log(ApiResult)
                        res.send(ApiResult)
                    })
                })
            }
        }catch(err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    },

    ScrapListAnime : function(){
        try {
            return new Promise((resolve, reject) => {
                return promise(url).then(function(html){
                    const retunData = [];
                    bodyContainer = cheerio('.container-left',html).html()
                    cheerio('.arrow-list > li',bodyContainer).each(function(){
                        var name = cheerio(this).find("a").text();
                        var href = cheerio(this).find("a").attr('href');
                        var slug = href.substring(href.indexOf('h/') + 2);
                        var code = md5(slug);
                        var name_index = name.charAt(0).match(/[a-z]/i) ? name.charAt(0) : '#';
                        var create_dateate = dateTime.create();
                        var date_time = create_dateate.format('Y-m-d H:M:S');
                        retunData.push({
                            code : code,
                            title : name,
                            slug : slug,
                            href : href,
                            name_index : name_index,
                            cron_at : date_time
                        });
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

    updateMysql : function(data) {
        try {
            const NumberUpdate = [];
            const NumberSave = [];
            return new Promise((resolve, reject) => {
                data.forEach(async (element, index, array) => {
                    const getList = await MainModels.ListAnimeTab.findOne({
                        where: {slug:element.slug}
                    });
                    if(getList){
                        const updateList = new MainModels.ListAnimeTab({
                            code:element.code,
                            title:element.title,
                            slug:element.slug,
                            name_index: element.name_index,
                            href: element.href,
                            cron_at: element.cron_at,
                        },{
                            where: {id:getList.id}
                        })
                        await updateList.update();
                        const LogSave = {
                            "hit_date": element.cron_at,
                            "slug":element.slug,
                            "status": "Success",
                            "message":"Data Update"
                        }
                        console.log(LogSave)
                        NumberUpdate.push(1)
                    }else{
                        const newList = new MainModels.ListAnimeTab({
                            code:element.code,
                            title:element.title,
                            slug:element.slug,
                            name_index: element.name_index,
                            href: element.href,
                            cron_at: element.cron_at,
                        })
                        await newList.save();
                        const LogSave = {
                            "hit_date": element.cron_at,
                            "slug":element.slug,
                            "status": "Success",
                            "message":"Data Save"
                        }
                        console.log(LogSave)
                        NumberSave.push(1)
                    }
                    if (index === array.length -1){
                        const status = {
                            "SaveCount" : NumberSave.length,
                            "UpdateCount" : NumberUpdate.length,
                            "ErrorCount" : 0,
                            "Status" : "Complete",
                            "Message": ""
                        }    
                        resolve(status);
                    } 
                });
            });
            
        }catch(err) {
            LogErr = {
                "SaveCount" : NumberSave.length,
                "UpdateCount" : NumberUpdate.length,
                "ErrorCount" : 1,
                "Status": "Not Complete",
                "Message": err.message
            }
            return LogErr
        }
    },
    
}
