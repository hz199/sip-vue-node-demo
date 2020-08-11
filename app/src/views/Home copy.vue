<template>
  <el-row>
    <el-col :span="12">
      <el-card class="card-wrapper">
        <el-form ref="form" :model="formData" label-width="100px">
          <el-form-item label="用户名:">
            <el-input v-model="formData.userName" placeholder="例如: sip:alice@example.com"></el-input>
          </el-form-item>
          <el-form-item label="SIP 密码:">
            <el-input v-model="formData.password" placeholder="SIP 密码"></el-input>
          </el-form-item>
          <el-form-item label="SIP URI:">
            <el-input v-model="formData.sipUri" placeholder="例如: sip:alice@example.com"></el-input>
          </el-form-item>
          <el-form-item label="WSS URI:">
            <el-input v-model="formData.sipWssUri" placeholder="例如: wss://example.com"></el-input>
          </el-form-item>
          <el-form-item label="SIP 呼叫地址:">
            <el-input v-model="formData.callPhoneUri" placeholder="例如: sip:3000@192.168.40.96:5060"></el-input>
          </el-form-item>
          <el-form-item class="submit-form-item">
            <el-button type="primary" @click="initJsSip" v-if="!isConnect">
              <i class="el-icon-star-on"></i> 初始化
            </el-button>
            <el-button type="success" @click="callPhone">
              <i class="el-icon-phone-outline"></i> call
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card class="card-wrapper">
        55
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import JsSIP from 'jssip'

export default {
  name: 'Home',
  data () {
    return {
      formData: {
        userName: '1000',
        sipUri: '1000@182.92.0.247:5006',
        password: 'freeswitchXOR1234VOip#WOXESs',
        sipWssUri: 'ws://182.92.0.247:5066',
        callPhoneUri: ''
      },
      isConnect: false,
      // 用户代理实例
      userAgent: null,
      // 铃声
      incomingCallAudio: null,
      // 通话语音audio
      remoteAudio: null,
      // jssip UA 实例
      jsSipUAInstance: null,
      // session instance
      sessionInstance: null
    }
  },
  components: {
  },
  methods: {
    initJsSip () {
      this.initJsSipParams()
    },
    callPhone () {
      const callOptions = {
        mediaConstraints: {audio: true, video: false}
      }
      if (!this.formData.callPhoneUri) {
        this.$message({
          type: 'error',
          message: '请先填写呼叫地址~'
        })
        return
      }
      this.jsSipUAInstance.call(this.formData.callPhoneUri, callOptions)
    },
    // 初始换铃声
    initIncomingCallAudio () {
      this.incomingCallAudio = new window.Audio('http://study.closeeyes.cn/incoming-call-ringtone.mp3')
      this.incomingCallAudio.loop = true
    },
    // 初始化jssip参数
    initJsSipParams () {
      // 通话语音audio
      this.remoteAudio = new window.Audio()
      this.remoteAudio.autoplay = true
      // debug
      JsSIP.debug.enable('JsSIP:*')
      // jssip UA
      const socket = new JsSIP.WebSocketInterface(this.formData.sipWssUri)
      const { sipUri, password, sipWssUri } = this.formData

      const configuration = {
        sockets: [socket],
        uri: sipUri,
        password: password,
        ws_servers: sipWssUri,
      }

      // 初始化 UA实例
      this.jsSipUAInstance = new JsSIP.UA(configuration)
      this.isConnect = true

      this.registrationFailed()
      this.newRTCSession()
    },
    // 如果失败是由此类响应的接收产生的，则为接收到的SIP否定响应的实例，否则为null
    registrationFailed () {
      this.jsSipUAInstance.on('registrationFailed', function(ev){
        this.$message({
          message: `error:${ev.cause}`,
          type: 'error'
        })
      })
    },
    // 传入或传出会话/呼叫触发。
    newRTCSession () {
      this.jsSipUAInstance.on('newRTCSession', function(ev) {
        var newSession = ev.session
        console.log(ev, 1111111111111)
        if (this.sessionInstance) {
          // 如果存在呼叫 挂断呼叫
          this.sessionInstance.terminate()
        }

        this.sessionInstance = newSession

        this.sessionInstance.on('ended', (data) => {
          console.log('ended', data)
        })
        this.sessionInstance.on('failed', (data) => {
          console.log('failed', data)
        })
        this.sessionInstance.on('accepted', (data) => {
          console.log('accepted', data)
        })
        this.sessionInstance.on('confirmed',function () {})

        this.sessionInstance.on('addstream', function(e){
          this.incomingCallAudio.pause()
          this.remoteAudio.src = window.URL.createObjectURL(e.stream)
        })

        // 如果电话正在打进来播放铃声
        if(this.sessionInstance.direction === 'incoming'){
            this.incomingCallAudio.play()
        }
      })
    },
    // 挂断电话
    hangup (){
      this.sessionInstance.terminate()
    }
  },
  mounted () {
    this.initIncomingCallAudio()
  }
}
</script>
<style lang="less">
.card-wrapper {
  margin: 0 20px;
}
.submit-form-item {
  text-align: right;
}
</style>
