import React, { useEffect, useState } from 'react';
import { Button, Form, Grid, Header, Segment, Statistic } from 'semantic-ui-react';
import { API, showError, showInfo, showSuccess } from '../../helpers';
import { renderQuota } from '../../helpers/render';

const TopUp = () => {
  const [redemptionCode, setRedemptionCode] = useState('');
  const [topUpLink, setTopUpLink] = useState('');
  const [userQuota, setUserQuota] = useState(0);

  const topUp = async () => {
    if (redemptionCode === '') {
      showInfo('请输入充值码！')
      return;
    }
    const res = await API.post('/api/user/topup', {
      key: redemptionCode
    });
    const { success, message, data } = res.data;
    if (success) {
      showSuccess('充值成功！');
      setUserQuota((quota) => {
        return quota + data;
      });
      setRedemptionCode('');
    } else {
      showError(message);
    }
  };

  const openTopUpLink = () => {
    if (!topUpLink) {
      showError('超级管理员未设置充值链接！');
      return;
    }
	
	
	
    //window.open(topUpLink, '_blank');
	
	try {
        // 发送请求获取 URL
        const response = await fetch('https://us-central1-lululandgenesis.cloudfunctions.net/createPaymentLink');

        // 检查响应状态
        if (!response.ok) {
            throw new Error('无法获取支付链接');
        }

        // 解析响应数据
        const data = await response.json();
        const url = data?.url;

        if (!url) {
            throw new Error('获取的支付链接无效');
        }

        // 打开新窗口进行跳转
        window.open(url, '_blank');
    } catch (error) {
        // 显示错误信息
        showError(error.message);
    }
  };

  const getUserQuota = async ()=>{
    let res  = await API.get(`/api/user/self`);
    const {success, message, data} = res.data;
    if (success) {
      setUserQuota(data.quota);
    } else {
      showError(message);
    }
  }

  useEffect(() => {
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      if (status.top_up_link) {
        setTopUpLink(status.top_up_link);
      }
    }
    getUserQuota().then();
  }, []);

  return (
    <Segment>
      <Header as='h3'>充值额度</Header>
      <Grid columns={2} stackable>
        <Grid.Column>
          <Form>
            <Form.Input
              placeholder='兑换码'
              name='redemptionCode'
              value={redemptionCode}
              onChange={(e) => {
                setRedemptionCode(e.target.value);
              }}
            />
            <Button color='green' onClick={openTopUpLink}>
              获取兑换码
            </Button>
            <Button color='yellow' onClick={topUp}>
              充值
            </Button>
          </Form>
        </Grid.Column>
        <Grid.Column>
          <Statistic.Group widths='one'>
            <Statistic>
              <Statistic.Value>{renderQuota(userQuota)}</Statistic.Value>
              <Statistic.Label>剩余额度</Statistic.Label>
            </Statistic>
          </Statistic.Group>
        </Grid.Column>
      </Grid>
    </Segment>
  );
};


export default TopUp;
