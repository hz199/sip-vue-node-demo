<template>
  <el-row>
    <el-col :span="12">
      <el-card class="card-wrapper">
        <el-form ref="form" :model="formData" label-width="100px">
          <el-form-item label="SIP URI:">
            <el-input v-model="formData.sipUri" placeholder="例如: sip:alice@example.com"></el-input>
          </el-form-item>
          <el-form-item label="SIP 密码:">
            <el-input v-model="formData.password" placeholder="SIP 密码"></el-input>
          </el-form-item>
          <el-form-item label="WSS URI:">
            <el-input v-model="formData.sipWssUri" placeholder="例如: wss://example.com"></el-input>
          </el-form-item>
          <el-form-item label="SIP 呼叫地址:">
            <el-input v-model="formData.callPhoneUri" placeholder="例如: sip:3000@192.168.40.96:5060"></el-input>
          </el-form-item>
          <el-form-item class="submit-form-item">
            <el-button type="primary" @click="initJsSip">
              <i class="el-icon-star-on"></i> 初始化
            </el-button>
            <el-button type="success" @click="classPhone">
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
      formData: {},
      // 用户代理实例
      userAgent: null,
      // 铃声
      incomingCallAudio: null,
      // 通话语音audio
      remoteAudio: null,
      // jssip UA 实例
      jsSipUAInstance: null
    }
  },
  components: {
  },
  methods: {
    initJsSip () {
      this.incomingCallAudio.play()
    },
    classPhone () {},
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
      // jssip UA
      const socket = new JsSIP.WebSocketInterface("ws://182.92.0.247:5066/ws")
      const configuration = {
        sockets: [socket],
        uri: '',
        password: '',
        ws_servers: '',
      }

      // 初始化 UA实例
      this.jsSipUAInstance = new JsSIP.UA(configuration)
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
