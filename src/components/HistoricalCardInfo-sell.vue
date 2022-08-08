<template>
  <div id="HistoricalCardInfo" @click="close($event)">
    <div class="content" ref="maskContent">
      <div class="closeView"><span @click.stop="closeView">Close</span></div>
      <div class="cardView" v-for="(item,index) in cardInfoList" :key="index" :class="{'cardView-true': which===index}" @click="choiseCardInfo(item,index)">
        <div class="line1">
          <div class="line1-left">{{ item.name }}</div>
          <div class="line1-right"><span>****</span>{{ item.accountNumber.substring(item.accountNumber.length-4,item.accountNumber.length) }}</div>
        </div>
<!--        <div class="line2">{{ item.name }}</div>-->
      </div>
    </div>
  </div>
</template>

<script>
import {AES_Decrypt, AES_Encrypt} from "../utils/encryp";

export default {
  name: "HistoricalCardInfo-sell",
  data(){
    return{
      which: 0,
      cardInfo: {},
      cardInfoList: [],
    }
  },
  watch: {
    '$store.state.sellRouterParams.cardInfoList': {
      deep: true,
      immediate: true,
      handler(val){
        if(val !== undefined){
          let cardInfoList = val.length !== 0 ? JSON.parse(JSON.stringify(val)) : [];
          this.cardInfo = val[0];
          cardInfoList.forEach((item,index)=>{
            cardInfoList[index].accountNumber = AES_Decrypt(item.accountNumber);
            cardInfoList[index].name = AES_Decrypt(item.name);
          })
          this.cardInfoList = cardInfoList;
        }
      }
    }
  },
  methods: {
    choiseCardInfo(item,index){
      let cardInfo = JSON.parse(JSON.stringify(item));
      cardInfo.accountNumber = AES_Encrypt(cardInfo.accountNumber);
      cardInfo.name = AES_Encrypt(cardInfo.name);
      this.cardInfo = cardInfo;
      this.which = index;
      //赋值卡信息 关闭卡信息组件
      this.$store.state.sellForm = this.cardInfo;
      this.$parent.$refs.routerView.decryptCardInfo(this.cardInfo);
      this.$parent.historicalCardInfoSell_state = false;
    },
    close(event){
      if(!this.$refs.maskContent.contains(event.target)){
        this.$parent.historicalCardInfoSell_state = false;
      }
    },
    closeView(){
      this.$parent.historicalCardInfoSell_state = false;
    },
  }
}
</script>

<style lang="scss" scoped>
#HistoricalCardInfo{
  z-index: 9;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.15);
  .content{
    margin: 1.54rem auto;
    width: 3.45rem;
    background: #FFFFFF;
    border-radius: 0.18rem;
    padding: 0.32rem 0.16rem;
    .closeView{
      text-align: right;
      font-family: SFProDisplayRegular;
      font-weight: 400;
      font-size: 0.18rem;
      line-height: 0.21rem;
      color: #0047AD;
      padding-right: 0.14rem;
      span{
        cursor: pointer;
      }
    }
    .cardView{
      width: 100%;
      min-height: 0.56rem;
      background: #FFFFFF;
      border: 1px solid #EEEEEE;
      border-radius: 0.06rem;
      padding: 0 0.16rem;
      margin-top: 0.16rem;
      cursor: pointer;
      &:first-child{
        margin-top: 0;
      }
      .line1{
        display: flex;
        font-family: 'SFProDisplaybold',SFProDisplaybold;
        font-weight: 600;
        font-size: 0.16rem;
        text-align: center;
        color: #949EA4;
        margin-top: 0.2rem;
        .line1-left{
          font-family: SFProDisplayRegular;
          font-weight: 400;
          font-size: 0.13rem;
          color: #6E7687;
        }
        .line1-right{
          margin-left: auto;
          font-family: 'SFProDisplaybold',SFProDisplaybold;
          font-weight: 600;
          font-size: 0.16rem;
          text-align: center;
          color: #949EA4;
          span{
            color: #C2C2C2;
          }
        }
      }
      .line2{
        font-family: 'SFProDisplaybold',SFProDisplaybold;
        font-weight: 400;
        font-size: 0.13rem;
        color: #949EA4;
        margin-top: 0.08rem;
      }
    }

    //选中样式
    .cardView-true{
      background: #FFF4DE;
      border: 1px solid #FBE3B6;
      .line1{
        color: #8A5B00;
        .line1-left{
          color: #8A5B00;
        }
        .line1-right{
          color: #8A5B00;
          span{
            color: #DDBD7E;
          }
        }
      }
      .line2{
        color: #8A5B00;
      }
    }
  }
}
</style>
