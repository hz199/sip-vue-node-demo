<template>
  <el-row>
    <el-col :span="12">
      <el-card class="card-wrapper">
        <el-form ref="form" :model="formData" label-width="100px">
          <el-form-item label="SIP URI:">
            <el-input v-model="formData.name" placeholder="例如: sip:alice@example.com"></el-input>
          </el-form-item>
          <el-form-item label="SIP 密码:">
            <el-input v-model="formData.name" placeholder="SIP 密码"></el-input>
          </el-form-item>
          <el-form-item label="WSS URI:">
            <el-input v-model="formData.name" placeholder="例如: wss://example.com"></el-input>
          </el-form-item>
          <el-form-item label="SIP 呼叫地址:">
            <el-input v-model="formData.name" placeholder="例如: sip:3000@192.168.40.96:5060"></el-input>
          </el-form-item>
          <el-form-item class="submit-form-item">
            <el-button type="primary" @click="handleSubmit">立即创建</el-button>
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

export default {
  name: 'Home',
  data () {
    return {
      formData: {}
    }
  },
  components: {
  },
  methods: {
    handleSubmit () {

    }
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
