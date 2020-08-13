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
            <el-button type="primary" @click="initSipParams">
              <i class="el-icon-star-on"></i> 初始化
            </el-button>
            <el-button type="success" @click="callPhone">
              <i class="el-icon-phone-outline"></i> call
            </el-button>
            <el-button type="error" @click="hangUp">
              <i class="el-icon-phone-outline"></i> 挂断
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
import Sipphone from './utils/sipphone'

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
      // 铃声
      incomingCallAudio: null,
      // session instance
      UAInstance: null,
      SIPUAInstance: null
    }
  },
  components: {
  },
  methods: {
    // 初始换铃声
    initIncomingCallAudio () {
      this.incomingCallAudio = new window.Audio('http://study.closeeyes.cn/incoming-call-ringtone.mp3')
      this.incomingCallAudio.loop = true
    },
    // 初始化jssip参数
    async initSipParams () {
      const servers = [{
        protocol: 'ws',
        server: '182.92.0.247',
        port: 5066
      }]

      const account = {
        name: 'TEST USER',
        no: '1000', // 账号 caller
        pwd: 'freeswitchXOR1234VOip#WOXES'
      }

      this.SIPUAInstance = new Sipphone(account, servers)
      this.UAInstance = this.SIPUAInstance.init('#remoteAudio')
    },
    callPhone () {
      if (!this.formData.callPhoneUri) {
        this.$message({
          type: 'error',
          message: '请先填写呼叫地址~'
        })
        return
      }

      this.SIPUAInstance.inviteCall(this.formData.callPhoneUri)
    },
    hangUp () {
      this.SIPUAInstance.hangUp()
    }
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
