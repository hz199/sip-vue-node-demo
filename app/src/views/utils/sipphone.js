import { UA } from 'sip.js'
import { EventEmitter } from './EventEmitter'
class SipPhone {
  constructor(account, server) {
    this.sipAccount = account
    this.sipServers = server
    // ua 实例
    this.SipUA = null
    // 媒体 audio dom
    this.mediaAudioDom = null
    // 当前电话 invite 返回值
    this.sessionall = null
    // 自定义事件
    this.EventEmitter = new EventEmitter()
    this.on = this.EventEmitter.on
    this.emit = this.EventEmitter.emit
  }

  get sipConfig() {
    const uri = `${this.sipAccount.no}@${this.sipServers[0].server}`
    const wsServers = this.sipServers.map(item => `${item.protocol}://${item.server}:${item.port}`)
    const authorizationUser = this.sipAccount.no
    const password = this.sipAccount.pwd

    const config = {
      uri,
      transportOptions: {
        wsServers,
        maxReconnectionAttempts: 99999999, // 两年
        reconnectionTimeout: 5
      },
      sessionDescriptionHandlerFactoryOptions: {
        peerConnectionOptions: {
          rtcConfiguration: {
            iceServers: [
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun.fwdnet.net' },
              { urls: 'stun:stun.ekiga.net' },
              { urls: 'stun:stun.ideasip.com' }
            ]
          }
        }
      },
      authorizationUser,
      password,
      allowLegacyNotifications: true,
      autostart: true,
      register: true,
      registerExpires: 60,
      traceSip: true,
      log: {
        builtinEnabled: false,
        // level, category, label, content
        // connector: (...args) => {
        //   console.log(args)
        // },
        level: 'debug' // "debug", "log", "warn", "error"
      },
      // rel100: SIP.C.supported.SUPPORTED
    }
    return config
  }

  init(remoteAudio) {
    if (!remoteAudio) return new Error('请确定audio dom 存在')

    const config = this.sipConfig
    this.SipUA = new UA(config)
    // 绑定事件
    this.bindSipUAEvents()
    this.mediaAudioDom = remoteAudio
    return this.SipUA
  }

  // 绑定 ua 回调事件
  bindSipUAEvents() {
    // 当UA被其他用户拨打时（也就说呼入的时候）
    this.SipUA.on('invite', (session) => {
      console.log('session', session)
    })

    // 当连接到server时的回调
    this.SipUA.on('connecting', () => {
      console.log(`[sipcall] 连接到server时的回调`)
    })

    // 当完成连接时的回调
    this.SipUA.on('connected', () => {
      // 如果用户已注册，则发出"已准备好"信号，否则发出"未准备好"
      console.log(`[sipcall] 完成连接时的回调`)
    })

    // 当用户退出登录时
    this.SipUA.on('unregistered', (response, cause) => {
      console.log(`[sipcall] 用户退出登录时 ${response} ${cause}`)
    })

    // 当用户以登录时
    this.SipUA.on('registered', () => {
      console.log(`[sipcall] 用户以登录时`)
    })

    // 当用户断开连接时
    this.SipUA.on('disconnected', () => {
      console.log(`[sipcall] 户断开连接时`)
    })

    // 当注册失败时
    this.SipUA.on('registrationFailed', (response, cause) => {
      console.log(`[sipcall] on registrationFailed ${response} ${cause}`)
    })

    this.SipUA.on('transportCreated', (transport) => {
      transport.on('transportError', this.onTransportError.bind(this))
    })

    this.SipUA.on('message', (message) => {
      console.log(`[sipcall] on receive message ${message}`)
    })
  }

  async inviteCall(callNumber) {
    if (!callNumber) return new Error('请确定电话号码存在')
    if (this.sessionall) {
      this.sessionall.close()
    }

    this.sessionall = await this.SipUA.invite(callNumber)

    this.bindInviteEvent(this.sessionall, this.mediaAudioDom)
  }

  hangUp () {
    if (!this.sessionall) {
      return;
    } else if (this.sessionall.startTime) { // Connected
      this.sessionall.bye();
    } else if (this.sessionall.reject) { // Incoming
      this.sessionall.reject();
    } else if (this.sessionall.cancel) { // Outbound
      this.sessionall.cancel();
    }
  }

  bindInviteEvent (sessionall, mediaAudioDom) {
    // 打电话的音频接收 200
    sessionall.on('accepted',function(){
      const pc = sessionall.sessionDescriptionHandler.peerConnection
      const AUDIO_DOM = document.querySelector(mediaAudioDom)

      const remoteStream = new MediaStream()
      pc.getReceivers().forEach(function(receiver) {
        remoteStream.addTrack(receiver.track)
      });
      // 普通电话在remoteAudio直接播放
      AUDIO_DOM.srcObject = remoteStream
      AUDIO_DOM.play()
    })
    // 挂机
    sessionall.on('bye', function(){
      console.log('挂机')
    })

    // // 失败
    sessionall.on('failed', function(response, cause){
      console.log('失败', response, cause)
    })
  }
}

export default SipPhone