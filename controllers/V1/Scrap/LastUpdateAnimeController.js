const env = require("dotenv");
env.config()
const MainModels = require('../../../models/V1/MainModels')
const DetailAnimeController = require('./DetailAnimeController')
const promise = require('request-promise');
const md5 = require('md5');
const dateTime = require('node-datetime');
const moment = require('moment'); // require
const cheerio = require('cheerio');
const url = process.env.URL_LAST_UPDATE

module.exports = {
    LastUpdateAnime : async function(req, res, next){
        try {
            const startTime = new Date();
            var UrlLastUpdate = '';
            ApiKey = req.header("X-API-KEY")
            const getUser = await MainModels.UserTab.findOne({
                where: {token:ApiKey}
            });
            if(getUser){
                var PageNumber = req.header("PageNumber")
                    PageNumber = parseInt(PageNumber, 10)
                if(typeof PageNumber !== 'undefined' && Number.isInteger(PageNumber)){
                    UrlLastUpdate = url+'/page/'+PageNumber
                }else{
                    UrlLastUpdate = url;
                }
                const scrapLastUpdate = module.exports.ScrapLastUpdate(UrlLastUpdate)
                scrapLastUpdate.then(function(result) {
                    // const saveData =  module.exports.SaveDataMysql(result)
                    // saveData.then(function(result) {
                    //     const endTime = new Date();
                    //     const SpeedTime = (endTime - startTime)/1000; 
                    //     const Timestamp = moment().format()
                    //     const ApiResult = {
                    //         "API_TheMovieRs": {
                    //             "Version": "N.1",
                    //             "Timestamp": Timestamp,
                    //             "NameEnd": "Streaming Anime Scrap",
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
            }
        }catch(err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    },
    ScrapLastUpdate : function(url){
        try { 
            return new Promise((resolve, reject) => {
                return promise(url).then(function(html){
                    var bodyContainer = cheerio('.container',html).html(),
                        retunData = [],
                        listUpdate = [],
                        totalSearchPage = '',
                        pageSearch = '',
                        create_dateate = dateTime.create(),
                        date_time = create_dateate.format('Y-m-d H:M:S');
                    cheerio('.container-item',bodyContainer).each(function(){
                        cheerio(this).find(".dl-item").each(function(){
                            var hrefEps = cheerio(this).find("a").attr('href');
                            var slugEps = hrefEps.substring(hrefEps.indexOf('h/') + 2);
                                slugEps = slugEps.replace("/episode/", "-");
                            var title = slugEps.replace(/-/g, " ");
                            var title_alias = cheerio(this).find("a").text();
                                title_alias = title_alias.replace(/[|&;$%@"<>()+,]/g, "").trim()
                            var episode = hrefEps.substring(hrefEps.indexOf('episode/') + 8);
                            
                            listUpdate.push({
                                code : md5(slugEps),
                                slug : slugEps,
                                image : '',
                                title : title,
                                title_alias : title_alias,
                                status : '',
                                episode : episode,
                                href_episode : hrefEps,
                             })
                             
                        })
                    })
                    cheerio('.pagination',bodyContainer).each(function(){
                        cheerio(this).find("li").each(function(){
                            var hrefPage = cheerio(this).find("a").attr('href');
                            totalSearchPage = hrefPage.substring(hrefPage.indexOf('page/') + 5);
                        })
                        cheerio(this).find(".active").each(function(){
                            var hrefPage = cheerio(this).find("a").attr('href');
                            pageSearch = hrefPage.substring(hrefPage.indexOf('page/') + 5);
                        })
                    })
                    
                    retunData.push({ 
                        page_search : pageSearch,
                        total_search_page : totalSearchPage,
                        list_update : listUpdate,
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
}