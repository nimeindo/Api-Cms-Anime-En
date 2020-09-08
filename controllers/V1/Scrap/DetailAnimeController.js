
const env = require("dotenv");
env.config()
const MainModels = require('../../../models/V1/MainModels')
const promise = require('request-promise');
const md5 = require('md5');
const dateTime = require('node-datetime');
const moment = require('moment'); // require
const cheerio = require('cheerio');

module.exports = {

    DetailAnime : async function(req, res, next){
        try {
            const startTime = new Date()
            ApiKey = req.header("X-API-KEY")
            const getUser = await MainModels.UserTab.findOne({
                where: {token:ApiKey}
            });
            if(getUser){
                const URLDetail = req.header("URL-DETAIL")
                
                if(typeof URLDetail !== 'undefined' && URLDetail){
                    const scrapDetail = module.exports.ScrapDetailAnime(URLDetail)
                    scrapDetail.then(function(result) {
                        console.log(result)
                        // const saveData =  module.exports.updateMysql(result)
                        // saveData.then(function(result) {
                        //     console.log(result)
                        //     const endTime = new Date();
                        //     const SpeedTime = (endTime - startTime)/1000; 
                        //     const Timestamp = moment().format()
                        //     const ApiResult = {
                        //         "API_TheMovieRs": {
                        //             "Version": "N.1",
                        //             "Timestamp": Timestamp,
                        //             "NameEnd": "List Anime Scrap",
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
                        // })
                    })
                }else{
                    console.log("data kosong")
                }
                // process.exit()
                
            }
        }catch(err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    },
    ScrapDetailAnime : function(url){
        try {
            return new Promise((resolve, reject) => {
                return promise(url).then(function(html){
                    const retunData = [];
                    bodyContainer = cheerio('.container',html).html()
                    console.log(bodyContainer)
                    // process.exit()
                    // cheerio('.arrow-list > li',bodyContainer).each(function(){
                        // var name = cheerio(this).find("a").text();
                        // var href = cheerio(this).find("a").attr('href');
                        // var slug = href.substring(href.indexOf('h/') + 2);
                        // var code = md5(slug);
                        // var name_index = name.charAt(0).match(/[a-z]/i) ? name.charAt(0) : '#';
                        // var create_dateate = dateTime.create();
                        // var date_time = create_dateate.format('Y-m-d H:M:S');
                        // retunData.push({
                        //     code : code,
                        //     title : name,
                        //     slug : slug,
                        //     href : href,
                        //     name_index : name_index,
                        //     cron_at : date_time
                        // });
                    // })
                    // resolve(retunData)
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
}