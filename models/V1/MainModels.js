const sequelize = require('sequelize')

const db = require('../../config/dbMysql')
const TIMESTAMP = require('sequelize-mysql-timestamp')(db);
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
    ListAnimeTab : ListAnimeTb,
    UserTab : UserTb,
}
