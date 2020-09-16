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
                        const saveData =  module.exports.SaveDataMysql(result)
                        saveData.then(function(result) {
                            console.log(result)
                            const endTime = new Date();
                            const SpeedTime = (endTime - startTime)/1000; 
                            const Timestamp = moment().format()
                            const ApiResult = {
                                "API_TheMovieRs": {
                                    "Version": "N.1",
                                    "Timestamp": Timestamp,
                                    "NameEnd": "Detail Anime Scrap",
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
    // For scrap data Detail
    ScrapDetailAnime : function(url){
        try {
            return new Promise((resolve, reject) => {
                return promise(url).then(function(html){
                    var bodyContainer = cheerio('.container',html).html(),
                        breadcrumb = cheerio('.top-breadcrumb',html).html(),
                        ListEps = [],
                        DetailItemStatus = [],
                        DetailItemGenre = [],
                        retunData = [],
                        synopsis = '', 
                        title = '', 
                        img = '', 
                        valueDetailItem = '', 
                        key = '',
                        Genre = '',
                        slug = '',
                        totalEps = '',
                        code = '',
                        type = '',
                        status = '',
                        rating = '',
                        score = '',
                        item = '',
                        years = '',
                        href = '',
                        create_dateate = dateTime.create(),
                        date_time = create_dateate.format('Y-m-d H:M:S');

                    // Get Url slug and code
                    cheerio('ol > li',breadcrumb).each(function(){
                        href = cheerio(this).find("a").attr('href');
                        slug = href.substring(href.indexOf('h/') + 2);
                        code = md5(slug);
                    })
                    // Get Image
                    cheerio('.animeDetail-image',bodyContainer).each(function(){
                        img = cheerio(this).find("img").attr('src');
                    })
                    // Get Score
                    cheerio('.animeDetailRate',bodyContainer).each(function(){
                        score = cheerio(this).find(".animeDetailRate-right").text();
                        score = score.replace(" ", "")
                        score = score.trim()
                    })
                    // Get Synopsis and Title
                    cheerio('.animeDetail-details',bodyContainer).each(function(){
                        synopsis = cheerio(this).find(".anime-details").text();
                        synopsis = synopsis.replace(/[|&;$%@"<>()+,]/g, "")
                        title = cheerio(this).find(".anime-title").text();  
                    })
                    // Get Genre season (info detail statsu)
                    cheerio('.animeDetail-tags',bodyContainer).each(function(){
                        cheerio(this).find(".animeDetail-item").each(function(){
                            key = cheerio(this).find("span").text(); 
                            item = cheerio(this).text(); 
                            item = item.substring(item.indexOf(':') + 2);
                            item = item.trim()
                            key = key.replace(" : ", "")
                            key = key.replace(" ", "_")
                            key = key.trim()
                            cheerio(this).find("a").each(function(){
                                valueDetailItem = cheerio(this).text(); 
                                DetailItemGenre.push({ 
                                    [key]:valueDetailItem
                                });
                            })
                            DetailItemStatus.push({ 
                                [key]:item
                            });
                        })  
                    })
                    // Get Episode List
                    cheerio('.ci-contents',bodyContainer).each(function(){
                        cheerio(this).find(".tnContent").each(function(){
                            totalEps = cheerio(this).find("li").length; 
                            cheerio(this).find("li").each(function(){
                                var hrefEps = cheerio(this).find("a").attr('href');
                                var slugEps = hrefEps.substring(hrefEps.indexOf('h/') + 2);
                                slugEps = slugEps.replace("/episode/", "-");
                                var codeEps = md5(slug);
                                var episode = hrefEps.substring(hrefEps.indexOf('e/') + 2);
                                ListEps.push({ 
                                    hrefEps : hrefEps,
                                    slugEps : slugEps,
                                    codeEps : codeEps,
                                    episode : episode
                                });
                            })  
                        })  
                    }) 
                    
                    DetailItemGenre.forEach((element, index, array) => {
                        if (typeof element.Genres !== 'undefined') {
                            Genre += element.Genres+","
                        }
                    });
                    DetailItemStatus.forEach((element, index, array) => {
                        if(typeof element.Type !== 'undefined') {
                            type = element.Type
                        }
                        if(typeof element.Rating !== 'undefined') {
                            rating = element.Rating
                        }
                        if(typeof element.Status !== 'undefined') {
                            status = element.Status
                        }
                        if(typeof element.First_Aired !== 'undefined') {
                            years = element.First_Aired
                        }
                    });
                    // for remove data duplcat
                    var removeDataDuplicate = ListEps;
                    ListEps = Array.from(new Set(removeDataDuplicate.map(JSON.stringify))).map(JSON.parse);
                    
                    retunData.push({
                        code : code,
                        slug : slug,
                        href : href,
                        title : title,
                        image : img,
                        status : status,
                        years : years,
                        tipe : type,
                        score : score,
                        synopsis : synopsis,
                        Genre : Genre,
                        rating : rating,
                        episode_total : totalEps,
                        list_episode: ListEps,
                        hari_tayang :'',
                        votes : '',
                        studio : '',
                        duration : '',
                        cron_at : date_time,
                    });
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
    // For Manajemen save data Detail and Data manajemen save episode from data ScrapDEtailAnime
    SaveDataMysql : function(data) {
        try {
            var dataList = [];
            var LogSave = [];
            return new Promise((resolve, reject) => {
                data.forEach(async (element, index, array) => {
                    const getList = await MainModels.ListAnimeTab.findOne({
                        where: {slug:element.slug}
                    });
                    // cek di list anime ada data atau tidak
                    if(getList){
                        const getDetail = await MainModels.DetailTab.findOne({
                            where: {slug:element.slug}
                        });
                        // cek detail anime ada data atu tidak
                        if(getDetail){
                            // Update Detail anime
                            await module.exports.UpdateDetails(element).then(async function(result) {
                                await module.exports.saveEpisodeMysql(element).then(async function(result) {
                                    LogSave = {
                                        "hit_date": element.cron_at,
                                        "status": "Success",
                                        "detail": {
                                            "SaveCount": 0,
                                            "UpdateCount": 1,
                                        },
                                        "list_episode":{
                                            "SaveCount": result.SaveCount,
                                            "UpdateCount": result.UpdateCount,
                                        },
                                        "message":"Detail Data Save"
                                    }
                                }) 
                            })
                            // console.log(updateDetail)
                            // NumberUpdate.push(1)
                        }else{
                            // save Detail anime
                            await module.exports.SaveDetail(element).then(async function(result) {         
                                // save Episode anime
                                await module.exports.saveEpisodeMysql(element).then(async function(result) {
                                     LogSave = {
                                        "hit_date": element.cron_at,
                                        "status": "Success",
                                        "detail": {
                                            "SaveCount": 1,
                                            "UpdateCount": 0,
                                        },
                                        "list_episode":{
                                            "SaveCount": result.SaveCount,
                                            "UpdateCount": result.UpdateCount,
                                        },
                                        "message":"Detail Data Save"
                                    }
                                }) 
                                
                            }) 
                            
                        }
                    }else{ 
                        var nameIndex = element.title.charAt(0).match(/[a-z]/i) ? element.title.charAt(0) : '#';
                        dataList.push({ 
                            code:element.code,
                            title:element.title,
                            slug:element.slug,
                            name_index: nameIndex,
                            href: element.href,
                            cron_at: element.cron_at,
                        });
                        // save list anime
                        await ListAnimeController.updateMysql(dataList).then(async function(result) {
                            // Cek Detail anime       
                            const getDetail = await MainModels.DetailTab.findOne({
                                where: {slug:element.slug}
                            });
                            if(getDetail){
                                // Update Detail anime       
                                await module.exports.UpdateDetails(element).then(async function(result) {
                                    await module.exports.saveEpisodeMysql(element).then(async function(result) {
                                        LogSave = {
                                            "hit_date": element.cron_at,
                                            "status": "Success",
                                            "detail": {
                                                "SaveCount": 0,
                                                "UpdateCount": 1,
                                            },
                                            "list_episode":{
                                                "SaveCount": result.SaveCount,
                                                "UpdateCount": result.UpdateCount,
                                            },
                                            "message":"Detail Data Save"
                                        }
                                    }) 
                                })
                            }else{
                                // Save Detail anime       
                                await module.exports.SaveDetail(element).then(async function(result) {    
                                    await module.exports.saveEpisodeMysql(element).then(async function(result) {
                                         LogSave = {
                                            "hit_date": element.cron_at,
                                            "status": "Success",
                                            "detail": {
                                                "SaveCount": 1,
                                                "UpdateCount": 0,
                                            },
                                            "list_episode":{
                                                "SaveCount": result.SaveCount,
                                                "UpdateCount": result.UpdateCount,
                                            },
                                            "message":"Detail Data Save"
                                        }
                                    }) 
                                 })
                            }
                             
                        })
                    }
                    resolve(LogSave)
                });
            });
        }catch(err) {
            LogErr = {
                "detail": [],
                'list_episode': [],
                "ErrorCount" : 1,
                "Status": "Not Complete",
                "Message": err.message
            }
            return LogErr
        }
    },
    // for save data detail
    SaveDetail: async function(element){
        try{
                var getList = await MainModels.ListAnimeTab.findOne({
                    where: {slug:element.slug}
                });
                const DetailSave = new MainModels.DetailTab({
                    id_list_anime : getList.id,
                    code : element.code,
                    title : element.title,
                    slug : element.slug,
                    image : element.image,
                    tipe : element.tipe,
                    genre : element.Genre,
                    status : element.status,
                    hari_tayang : element.hari_tayang,
                    episode_total : element.episode_total,
                    votes : element.votes,
                    years : element.years,
                    score : element.score,
                    rating : element.rating,
                    studio : element.studio,
                    duration : element.duration,
                    synopsis : element.synopsis,
                    cron_at : element.cron_at,
                })
                await DetailSave.save();
                const LogSave = {
                    "hit_date": element.cron_at,
                    "slug":element.slug,
                    "status": "Success",
                    "message":"Detail Data Save"
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
    // for update data details
    UpdateDetails: async function(element){
        try{
                const getDetail = await MainModels.DetailTab.findOne({
                    where: {slug:element.slug}
                });
                
                const updateDetail = await MainModels.DetailTab.update({
                    id_list_anime : getDetail.id_list_anime,
                    code : element.code,
                    title : element.title,
                    slug : element.slug,
                    image : element.image,
                    tipe : element.tipe,
                    genre : element.Genre,
                    status : element.status,
                    hari_tayang : element.hari_tayang,
                    episode_total : element.episode_total,
                    votes : element.votes,
                    years : element.years,
                    score : element.score,
                    rating : element.rating,
                    studio : element.studio,
                    duration : element.duration,
                    synopsis : element.synopsis,
                    cron_at : element.cron_at,
                },{
                    where: {id:getDetail.id}
                })
                await updateDetail;
                const LogSave = {
                    "hit_date": element.cron_at,
                    "slug":element.slug,
                    "status": "Success",
                    "message":"Detail Data Update"
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
    // for save data and update list episode
    saveEpisodeMysql: function(elements){
        try {
            const NumberUpdate = [];
            const NumberSave = [];
            return new Promise((resolve, reject) => {
                elements.list_episode.forEach(async (element, index, array) => {
                    const getEpisd = await MainModels.listEpslTab.findOne({
                        where: {slug:element.slugEps}
                    });
                    const getDetail = await MainModels.DetailTab.findOne({
                        where: {slug:elements.slug}
                    });
                    if(getEpisd){
                        const updateEps = await MainModels.listEpslTab.update({
                            id_list_anime : getDetail.id_list_anime,
                            id_detail_anime : getDetail.id,
                            code : element.codeEps,
                            slug : element.slugEps,
                            episode : element.episode,
                            href_episode : element.hrefEps,
                            cron_at : elements.cron_at,
                        },{
                            where: {id:getEpisd.id}
                        }) 
                        await updateEps;
                        const LogSave = {
                            "hit_date": elements.cron_at,
                            "slug":element.slugEps,
                            "status": "Success",
                            "message":"Epiode Data Update"
                        }
                        NumberUpdate.push(1)
                        console.log(LogSave)
                    }else{
                        const EpsSave = new MainModels.listEpslTab({
                            id_list_anime : getDetail.id_list_anime,
                            id_detail_anime : getDetail.id,
                            code : element.codeEps,
                            slug : element.slugEps,
                            episode : element.episode,
                            href_episode : element.hrefEps,
                            cron_at : elements.cron_at,
                        })
                        await EpsSave.save();
                        const LogSave = {
                            "hit_date": elements.cron_at,
                            "slug":element.slugEps,
                            "status": "Success",
                            "message":"Epiode Data Save"
                        }
                        NumberSave.push(1)
                        console.log(LogSave)
                    }
                    if (index === array.length -1){
                        const status = {
                            "SaveCount" : NumberSave.length,
                            "UpdateCount" : NumberUpdate.length,
                            "ErrorCount" : 0,
                            "Status" : "Complete Save Episode",
                            "Message": ""
                        } 
                        
                        resolve(status);
                    } 
                });
            });
        }catch(err) {
            LogErr = {
                "ErrorCount" : 1,
                "Status": "Not Complete",
                "Message": err.message
            }
            console.log(LogErr)
            return LogErr
        }
    }
}