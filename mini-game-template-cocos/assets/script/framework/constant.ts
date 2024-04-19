// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

export interface ICarInfo {
    ID: number;
    model: string;
    type: number;
    num: number;
}

export class constant {

    public static GAME_NAME = 'car';

    public static LOCAL_CACHE = {
        PLAYER: 'player',               //玩家基础数据缓存，如金币砖石等信息，暂时由客户端存储，后续改由服务端管理
        SETTINGS: 'settings',           //设置相关，所有杂项都丢里面进去
        DATA_VERSION: 'dataVersion',    //数据版本
        ACCOUNT: 'account',                 //玩家账号
        // TMP_DATA: 'tmpData',             //临时数据，不会存储到云盘
        HISTORY: "history",                   //关卡通关数据
        BAG: "bag",                         //玩家背包，即道具列表，字典类型
    }

    public static MAX_LEVEL = 20;        //最高关卡数

    public static MIN_CAR_ID = 101;
    public static MAX_CAR_ID = 109;

    public static AUDIO_SOUND = {
        BACKGROUND: 'background',       //背景音乐

        CRASH: "crash",             //撞车
        GET_MONEY: "getMoney",      //赚钱
        IN_CAR: "inCar",            //上车
        NEW_ORDER: "newOrder",      //新订单
        CAR_START: "carStart",      //车辆启动
        WIN: "win",                 //胜利
        STOP: "stop",               //刹车
        TOOTING1: "tooting1",        //鸣笛声1
        TOOTING2: "tooting2",         //鸣笛声2
    }
    
    //签到奖励状态
    public static SIGNIN_REWARD_STATUS = {
        RECEIVED: 0, //已经领取的
        RECEIVABLE: 1, //可以领取的
        UNRECEIVABLE: 2, //已经领取的
        FILL_SIGNIN: 3, //补签的
        AFTER_FILL_SIGNIN: 4, //已经补签的
    } 

    //签到的周期天数
    public static MAX_SIGNIN_DAY = 7 

    //次按钮在主界面显示后3秒再显示
    public static NORMAL_SHOW_TIME = 3

    //新手认定关卡（即小于该关卡数认为是新手）
    public static NEWBEE_LEVEL = 2;

    //奖励类型
    public static REWARD_TYPE = {
        DIAMOND: 1, //钻石
        GOLD: 2, //金币
        CAR: 3 //车辆
    }

    public static ONLINE = {
        MAX_TIME: 60,            //30分钟
        // MAX_TIME: 60,            //4个小时
        PROFIT_PER_SECOND: 0.3,       //每秒收益
        TIME_PER_CIRCLE: 10         //转一圈所需时间
    }

    public static SHARE_FUNCTION = {
        BALANCE: 'balance',                 //结算分享 
        RELIVE: 'relive',                   //复活
        OFFLINE: 'offline',                 //离线奖励
        RANK: 'rank',                       //排行榜
        LOTTERY: 'lottery',                 //抽奖
        LOTTERY_REWARD: 'lotteryReward',    //抽奖奖励，用于双倍分享
        TRIAL: 'trial',                     //试用
        CLICK_BOX: 'clickBox',              //点开宝箱
        ONLINE: 'online',                   //在线奖励
        SIGNIN: 'signIn',                   //签到
        FILL_SIGNIN: 'fillSignIn',          //补签
        INVINCIBLE: 'invincible',           //无敌
        SHOP_SHARE: 'shopShare',                       //商店里头的分享触发的
        SHOP_VIDEO: 'shopVideo',                       //商店里头的视频触发的
    }

    //初始车辆
    public static INITIAL_CAR = 1;

    //获取车辆类型
    public static BUY_CAR_TYPE = {
        GOLD: 1,            //金币 
        LOGIN: 2,           //2登录
        CONTINUOUS_LOGIN: 3,//3连续登录 
        SHARE: 4,           //4分享
        VIDEO: 5,           //5看视频
        GAME: 6,            //6进行游戏
        INVITE: 7,          //7邀请好友
        SIGNIN: 8,          //8签到
        PASS_LEVEL: 9        //9通关获得
    }

    //打开奖励的方式
    public static OPEN_REWARD_TYPE = {
        AD: 0,
        SHARE: 1,
        NULL: 2
    }   
    
    //如果车辆已有则转化为金币奖励
    public static GOLD_REWARD = {
        SECOND: 500, //第二天
        SEVENT: 500 //第七天
    }  

    //大转盘相关变量
    public static LOTTERY = {
        MONEY: 2000,            //1000块钱抽1次
        EXCHANGE: 500           //抽到已有的车自动转换成钱数
    }

    public static CUSTOMER_MAX_CNT = 2; //乘客总数量
    public static MENU_INIT_BOTTOM = 40; //误触菜单初始底部大小
    public static MENU_BOTTOM = 250; //误触菜单初始底部大小
    
}
