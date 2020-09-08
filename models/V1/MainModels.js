const sequelize = require('sequelize')

const db = require('../../config/dbMysql')
const TIMESTAMP = require('sequelize-mysql-timestamp')(db);
const DetailAnimeTb = db.define(
    "detail_anime",
    {
        'id': {
            type: sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        'id_list_anime': {
            type: sequelize.INTEGER,
        },
        'code': {type:sequelize.STRING},
        'title':{type:sequelize.STRING},
        'slug':{type:sequelize.STRING},
        'image':{type:sequelize.STRING},
        'tipe':{type:sequelize.STRING},
        'genre':{type:sequelize.STRING},
        'status':{type:sequelize.STRING},
        'hari_tayang':{type:sequelize.STRING},
        'episode_total':{type:sequelize.STRING},
        'votes':{type:sequelize.STRING},
        'years':{type:sequelize.STRING},
        'score':{type:sequelize.STRING},
        'rating':{type:sequelize.STRING},
        'studio':{type:sequelize.STRING},
        'duration':{type:sequelize.STRING},
        'synopsis': {type:sequelize.TEXT},
        'cron_at': {type:sequelize.DATE}
    },
    {
        freezeTableName:true
    }
);

const ListAnimeTb = db.define(
    "list_anime",
    {
        'id': {
            type: sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        'code': {type:sequelize.STRING},
        'title':{type:sequelize.STRING},
        'slug':{type:sequelize.STRING},
        'name_index': {type:sequelize.STRING},
        'href': {type:sequelize.TEXT},
        'cron_at': {type:sequelize.DATE}
    },
    {
        freezeTableName:true
    }
);

const UserTb = db.define(
    "User",{
        'id_user': {
            type: sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        'name': {type:sequelize.STRING},
        'email': {type:sequelize.STRING},
        'token': {type:sequelize.STRING},
        'status': {type:sequelize.STRING},
        'created_at':  TIMESTAMP,  
        'updated_at': TIMESTAMP,
        'deleted_at': TIMESTAMP
        
    },
    {
        freezeTableName:true,
    }
)


module.exports = {
    DetailTab : DetailAnimeTb,
    ListAnimeTab : ListAnimeTb,
    UserTab : UserTb,
}
