
import SIP, { UA } from 'sip.js'
import { EventEmitter } from "./EventEmitter";

class Sipphone {
  constructor(account, server) {
    this.sipAccount = account
    this.sipServers = server

    this.SipUA;
    this.currentSession = null;
    this.currentSessionParams = {
      audio: true,
      video: false
    };
    this.videoTrack = [];
    this.callback = {};
    this.mediaDom = {};
    this.modifiersParams = { ptime: '20', capturerate: '24000', bitrate: '30000' };
    this.EventEmitter = new EventEmitter()
    this.on = this.EventEmitter.on
    this.emit = this.EventEmitter.emit


    this.registerDefaultEvents()
  }

  // initial sip instance
  init(md) {
    const config = this.sipConfig
    this.SipUA = new UA(config)
    this.bindSipUAEvents()
    this.initialMediaDom(md)
    return this.SipUA
  }

  initialMediaDom(md) {
    if(md.remoteAudio) {
      this.mediaDom.remoteAudio = md.remoteAudio
    }
    if(md.remoteVideo) {
      this.mediaDom.remoteVideo = md.remoteVideo
    }
    if(md.localVideo) {
      this.mediaDom.localVideo = md.localVideo
    }
  }

  // bind callback events on sipua
  bindSipUAEvents() {
    // 当UA被其他用户拨打时（Call In）
    this.SipUA.on('invite', (session) => {
      console.log('session', session)
      this.onInviteEvent(session)
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

  // when someone invite you , tigger this function.
  onInviteEvent(session) {
    // if is talking
    if (this.currentSession !== null) {
      session.reject({
        statusCode: 486
      })
      return false
    }

    console.log('session222', session)

    this.currentSession = session
    this.setParamsBySessionMediaType(this.currentSession)
    this.bindIncomingCallSessionEvent(this.currentSession)
    if (this.isIncomingCallFromInternal(this.currentSession)) {
      this.emit('callIn', this.currentSession)
    } else {
      this.emit('callOutBack', this.currentSession)
    }
  }

  /**
   * @description: SDP modifiers
   * @param {type}
   * @return:
   */
  generateModifiers(modifiers = { ptime: '20', capturerate: '24000', bitrate: '30000' }) {
    const myModifier = (description) => {
      description.sdp = (description).sdp.replace(/a=fmtp:111 minptime=10;useinbandfec=1/img, `a=fmtp:111 ptime=${modifiers.ptime}; useinbandfec=1; maxplaybackrate=${modifiers.bitrate}; sprop-maxcapturerate=${modifiers.capturerate}; maxaveragebitrate=${modifiers.bitrate}; usedtx=1`);
      return Promise.resolve(description);
    };

    const modifierArray = [myModifier, SIP.Web.Modifiers.stripTelephoneEvent];
    return modifierArray;
  }

  /**
   * 呼叫其他用户
   * @params: number 用户号码, mediaType 媒体类型（audio音频/video视频）
  */
  invite(number, password = '') {
  // 如果是视频
    this.setCurrentSessionParams({ audio: true, video: false })

    // uri
    const uri = new SIP.URI('', number, this.sipServers[0].server)
    // 如果有密码，则在params中传入密码
    if (password) {
      uri.setParam('aaa', 'bbb') // 应后端需要，增加占位参数
      uri.setParam('matrix_conference_pin', password)
    }
    // descriptionModifier
    // const modifiers = this.generateModifiers(this.modifiersParams);
    // 呼叫其他用户，并返回该通话的session
    this.currentSession = this.SipUA.invite(uri, this.SessionParams)
    // 绑定当前session
    this.bindOutgoingCallSessionEvent(this.currentSession)
    // 呼出回调
    this.emit('callOut')
  }

  // is this coming call from internal (means outcall 's callback)
  isIncomingCallFromInternal(session) {
    // 如果呼入方是internal(内部)，则是回呼
    if (session && session.request && session.request.from && session.request.from.displayName === 'internal') {
      return false
    } else {
      return true
    }
  }

  onTransportError() {

  }

  bindOutgoingCallSessionEvent(session) {
    // 同意通话时
    session.on('accepted', (response, cause) => {
      console.log(`[sipcall] session accepted \n ${response} ${cause}`)
      this.emit('accepted', { response, cause })
    })

    // 被拒绝时
    // Fired each time an unsuccessful final (300-699) response is received. Note: This will also emit a failed event, followed by a terminated event.
    session.on('rejected', (response, cause) => {
      console.log(`[sipcall] session rejected ${response} ${cause}`)
      this.emit('stopTracks')
      // 被动挂断
      this.emit('hungup', { response, cause })
      this.emit('callEnd')
    })

    session.on('failed', (response, cause) => {
      console.log('[sipcall debug]', response, cause)
      const error = this.parseError(response)
      this.emit('error', error)
    })
  }

  // bind event on session
  bindIncomingCallSessionEvent(session) {
    console.log(session, 1111)
    // 被结束时
    session.on('bye', (request) => {
      console.log(`[sipcall] session bye`, request)
      this.emit('stopTracks')
      // 被动挂断
      this.emit('hungup', { request })
      this.emit('callEnd')
    })

    // 通话被取消时
    session.on('cancel', () => {
      console.log(`[sipcall] session cancel`)
      this.emit('stopTracks')
      // 被动挂断
      this.emit('hungup')
      this.emit('callEnd')
    });

    (session).on('failed', (request, cause) => {
      console.log('[sipcall debug]', request, cause)
      const error = this.parseError(request)
      this.emit('error', error)
    })

    // 有音视频流加入时
    // 仅展示的媒体类型
    session.on('trackAdded', () => {
      console.log('哈哈哈哈：：：：')
      // if (this.currentSessionParams.video) {
      //   console.log('[sipcall] video track comming ...')
      //   // localVideo.muted = true;
      //   // We need to check the peer connection to determine which track was added

      //   const pc = (session).sessionDescriptionHandler.peerConnection

      //   // Gets remote tracks
      //   const remoteStream = new MediaStream()
      //   pc.getReceivers().forEach(function(receiver) {
      //     remoteStream.addTrack(receiver.track)
      //   });
      //   this.mediaDom.remoteVideo.srcObject = remoteStream;
      //   this.mediaDom.remoteVideo.play()

      //   // Gets local tracks
      //   // const localStream = new MediaStream();
      //   // pc.getSenders().forEach(function(sender) {
      //   //   localStream.addTrack(sender.track);
      //   // });
      //   // localVideo.srcObject = localStream;
      //   // localVideo.play();
      //   const constraints = { audio: false, video: true }
      //   navigator.mediaDevices
      //     .getUserMedia(constraints)
      //     .then((stream) => {
      //       // 获取track句柄，方便结束时关闭
      //       this.videoTrack = this.videoTrack.concat(stream.getTracks());
      //       (this.mediaDom.localVideo).srcObject = stream;
      //       (this.mediaDom.localVideo).onloadedmetadata = () => {
      //         (this.mediaDom.localVideo).play()
      //       }
      //     })
      //     .catch((err) => {
      //       console.log(`[trackAdd local video] ${err.name}:${err.message}`)
      //     })
      // } else if (this.currentSessionParams.audio) {
      //   console.log('[音频：：：：] audio track comming ...')

      //   // We need to check the peer connection to determine which track was added
      //   const pc = session.sessionDescriptionHandler.peerConnection

        // // Gets remote tracks
        // const remoteStream = new MediaStream()
        // pc.getReceivers().forEach(function(receiver) {
        //   remoteStream.addTrack(receiver.track)
        // });
        // // 普通电话在remoteAudio直接播放
        // this.mediaDom.remoteAudio.srcObject = remoteStream;
        // this.mediaDom.remoteAudio.play()

      //   // this.RTCAnalysis({ peerConnection: pc, callbackFn: this.emit('RTCAnalysisCallback })
      // }
    })
  }

  /**
   * @description: 分析WebRTC数据
   * @param {type}
   * @return:
   */
  // RTCAnalysis({ peerConnection, repeatInterval = 10000, callbackFn }) {
  //   getStats(peerConnection, function (result) {
  //     const audioLatency = Number(result.audio.latency);
  //     const audioPacketsLost = Number(result.audio.packetsLost);
  //     const audioBytesReceived = Number(result.audio.bytesReceived);
  //     const audioBytesSent = Number(result.audio.bytesSent);

  //     // const speed = result.bandwidth.speed; // bandwidth download speed (bytes per second)
  //     let googSent = null
  //     let googReceived = null

  //     // result.results.forEach(function (item) {
  //     //   if (item.type === 'ssrc'/* && item.transportId === 'Channel-audio-1'*/) {
  //     //     if (item.hasOwnProperty('packetsSent')) {
  //     //       googSent = item
  //     //     } else if (item.hasOwnProperty('packetsReceived')) {
  //     //       googReceived = item
  //     //     }
  //     //   }
  //     // });

  //     // 时间戳
  //     const timestamp = parseTime(Date.now())
  //     callbackFn.call(this, {
  //       timestamp,
  //       audioLatency,
  //       audioPacketsLost,
  //       audioBytesReceived,
  //       audioBytesSent
  //     })
  //   }, repeatInterval);
  // }

  stopTracks() {
    if (this.videoTrack.length) {
      this.videoTrack.map(track => {
        track.stop()
      })
      this.videoTrack.splice(0)
    }
  }

  parseError(response) {
    const reason = response.reasonPhrase
    const code = response.statusCode

    let message = ''
    const messageType = 'warning'

    if (reason === SIP.C.causes.BUSY) {
      message = '对方正忙，请稍后再拨'
    } else if (reason === SIP.C.causes.REJECTED) {
      message = '您的呼叫被拒绝'
    } else if (reason === SIP.C.causes.REDIRECTED) {
      message = '对方号码可能被迁移'
    } else if (reason === SIP.C.causes.UNAVAILABLE) {
      message = '用户无法访问'
    } else if (reason === SIP.C.causes.NOT_FOUND) {
      message = '找不到该用户'
    } else if (reason === SIP.C.causes.ADDRESS_INCOMPLETE) {
      message = '地址不全'
    } else if (reason === SIP.C.causes.INCOMPATIBLE_SDP) {
      message = '不可用'
    } else if (reason === SIP.C.causes.AUTHENTICATION_ERROR) {
      message = '无授权'
    // } else if (cause === SIP.C.causes.INVALID_TARGET) {
    //   message = 'SIP URI 错误';
    } else if (reason === SIP.C.causes.CONNECTION_ERROR) {
      message = 'SIP Websocket 连接错误'
    } else if (reason === SIP.C.causes.REQUEST_TIMEOUT) {
      message = 'SIP 请求超时'
    } else if (code === 487) {
      // Request Terminated
      // message = '呼叫取消';
    } else if (code === 480) {
      // Temporarily Unavailable
      message = '对方暂时无法接听'
    } else {
      message = reason
    }
    return { message, messageType, reason, code }
  }

  setParamsBySessionMediaType(session) {
    // 需要wsc指定媒体类型
    if (session.body) {
      const sessionBody = session.body
      if (sessionBody.indexOf('video') > 0) {
        this.setCurrentSessionParams({ video: true })
        console.log('set options media to video')
      } else if (sessionBody.indexOf('audio') > 0) {
        this.setCurrentSessionParams({ audio: true })
        console.log('set options media to audio')
      }
    }
  }

  /**
   * 设置用户配置
   * params: {
   *    video: true,
   *    audio: true, 音频应该始终为true
   *    type: 'common' 普通电话 'meeting' 会议
   * }
  */
  // { audio = true, video = false }
  setCurrentSessionParams() {
    // 设置音频
    this.currentSessionParams.audio = true
    // 设置视频
    this.currentSessionParams.video = false
    return this.currentSession
  }

  /**
   * 全部回调
   * TODO: 做成订阅/发布
  */
  registerDefaultEvents() {
    this.on('callEnd', () => {
      // 通话结束的收尾工作
      this.currentSession = null
      this.emit('RTCAnalysisCallback', null)
    })
    this.on('error', (error) => {
      console.log(`[sipcall] error ${error.code}`)
    })
    this.on('stopTracks', () => {
      this.stopTracks()
    })
  }

  get SessionParams() {
    const { audio, video } = this.currentSessionParams
    const params = {
      // media: {
      //   constraints: {
      //     audio,
      //     video
      //   },
      //   // stream: this.silentStream,
      //   render: {}
      // },
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio,
          video
        }
      }
    }

    console.log(params)
    return params
  }

  // get sip config , depends on wsServers and sip account
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
        connector: () => {

        },
        level: 'debug' // "debug", "log", "warn", "error"
      },
      // rel100: SIP.C.supported.SUPPORTED
    }
    return config
  }

  // login to server
  login() {

  }
}

export { Sipphone }