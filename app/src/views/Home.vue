<template>
  <el-row>
    <el-col :span="12">
      <el-card class="card-wrapper">
        <el-form ref="form" :model="formData" label-width="100px">
          <el-form-item label="SIP 密码:">
            <el-input v-model="formData.password" placeholder="SIP 密码"></el-input>
          </el-form-item>
          <el-form-item label="SIP URI:">
            <el-input v-model="formData.uri" placeholder="例如: sip:alice@example.com"></el-input>
          </el-form-item>
          <el-form-item label="WSS URI:">
            <el-input v-model="formData.ws_servers" placeholder="例如: wss://example.com"></el-input>
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
        <audio id="remoteAudio"></audio>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
// import JsSIP from 'jssip'
import { UserAgent, Inviter, SessionState, Web } from 'sip.js'

export default {
  name: 'Home',
  data () {
    return {
      formData: {
        uri: '1000@182.92.0.247:5006',
        ws_servers: 'ws://182.92.0.247:5066',
        authorizationUser: '1000',
        password: 'freeswitchXOR1234VOip#WOXES'
      },
      isConnect: false,
      // 用户代理实例
      userAgent: null,
      // 铃声
      incomingCallAudio: null,
      // 通话语音audio
      remoteAudio: null,
      // jssip UA 实例
      SIPUAInstance: null,
      // session instance
      sessionInstance: null
    }
  },
  components: {
  },
  methods: {
    initJsSip () {
      this.initSipParams()
    },
    // 初始换铃声
    initIncomingCallAudio () {
      this.incomingCallAudio = new window.Audio('http://study.closeeyes.cn/incoming-call-ringtone.mp3')
      this.incomingCallAudio.loop = true
    },
    // 初始化jssip参数
    async initSipParams () {



      // console.log(this.formData.uri)
      // console.log(UserAgent.makeURI(this.formData.uri))
      // this.SIPUAInstance = new UserAgent({
      //   uri: UserAgent.makeURI(this.formData.uri),
      //   transportOptions: {
      //     server: this.formData.ws_servers
      //   },
      // })

      // await this.SIPUAInstance.start()
    },
    callPhone () {
      if (!this.formData.callPhoneUri) {
        this.$message({
          type: 'error',
          message: '请先填写呼叫地址~'
        })
        return
      }

      // 设置被呼叫的人员
      const targetCallPhone = UserAgent.makeURI(this.formData.callPhoneUri)
      console.log(targetCallPhone)
      if (!targetCallPhone) {
        this.$message({
          type: 'error',
          message: '呼叫人员不存在'
        })
        return
      }

      // 创建用户代理客户端以建立会话
      const inviter = new Inviter(this.SIPUAInstance, targetCallPhone, {
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: false }
        }
      })

      inviter.stateChange.addListener((newState) => {
        switch (newState) {
          case SessionState.Establishing:
            // Session is establishing
            break;
          case SessionState.Established:
            // Session has been established
            break;
          case SessionState.Terminated:
            // Session has terminated
            break;
          default:
            break;
        }
      });

      inviter.invite()

    },
  },
  mounted () {
    // this.initIncomingCallAudio()
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
