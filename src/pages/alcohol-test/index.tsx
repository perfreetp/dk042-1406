import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, Button, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StepIndicator from '@/components/StepIndicator';
import ResultCard from '@/components/ResultCard';
import useAppStore from '@/store';
import { mockBusList, mockRouteList } from '@/data/mockTasks';
import { mockUser } from '@/data/mockUser';
import type { TestStep, TestResult, StepConfig } from '@/types';
import { getAlcoholResult, formatDateTime } from '@/utils';

const STEPS: StepConfig[] = [
  { step: 1, title: '拍照签到', desc: '身份确认', status: 'active' },
  { step: 2, title: '酒精检测', desc: '吹气录入', status: 'pending' },
  { step: 3, title: '结果确认', desc: '完成检测', status: 'pending' }
];

const AlcoholTestPage: React.FC = () => {
  const router = useRouter();
  const busId = router.params.busId || '';
  const routeId = router.params.routeId || '';
  const addRecord = useAppStore((s) => s.addRecord);
  const addExceptionRecord = useAppStore((s) => s.addExceptionRecord);

  const bus = mockBusList.find((b) => b.id === busId);
  const route = mockRouteList.find((r) => r.id === routeId);

  const [currentStep, setCurrentStep] = useState<TestStep>(1);
  const [checkInPhoto, setCheckInPhoto] = useState<string>('');
  const [testPhoto, setTestPhoto] = useState<string>('');
  const [alcoholValue, setAlcoholValue] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>('pass');
  const [finalValue, setFinalValue] = useState<number>(0);

  const resultValue = useMemo(() => {
    return parseFloat(alcoholValue) || 0;
  }, [alcoholValue]);

  const canNextStep1 = !!checkInPhoto;
  const canNextStep2 = !!alcoholValue && !!testPhoto;

  const handleTakePhoto = async (type: 'checkIn' | 'test') => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album']
      });
      const path = res.tempFilePaths[0];
      console.log('[AlcoholTest] 拍照成功', { type, path });
      if (type === 'checkIn') {
        setCheckInPhoto(path || 'https://picsum.photos/id/177/400/300');
      } else {
        setTestPhoto(path || 'https://picsum.photos/id/91/400/300');
      }
    } catch (err) {
      console.error('[AlcoholTest] 拍照失败', err);
      const fallback =
        type === 'checkIn'
          ? 'https://picsum.photos/id/177/400/300'
          : 'https://picsum.photos/id/91/400/300';
      if (type === 'checkIn') setCheckInPhoto(fallback);
      else setTestPhoto(fallback);
    }
  };

  const handleQuickValue = (val: string) => {
    setAlcoholValue(val);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !canNextStep1) {
      Taro.showToast({ title: '请先拍照签到', icon: 'none' });
      return;
    }
    if (currentStep === 2 && !canNextStep2) {
      Taro.showToast({ title: '请完成酒精检测', icon: 'none' });
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as TestStep);
    } else {
      const result = getAlcoholResult(resultValue);
      setFinalValue(resultValue);
      setTestResult(result);
      setShowResult(true);
      console.log('[AlcoholTest] 完成检测', { value: resultValue, result });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as TestStep);
    } else {
      Taro.navigateBack();
    }
  };

  const handleResultPrimary = () => {
    if (testResult === 'pass') {
      addRecord({
        date: new Date().toISOString().split('T')[0],
        driverName: mockUser.name,
        plateNo: bus?.plateNo || '',
        routeName: route?.name || '',
        firstStopTime: route?.firstStopTime || '',
        status: 'pass',
        result: 'pass',
        alcoholValue: finalValue,
        checkInPhoto: checkInPhoto || 'https://picsum.photos/id/177/400/300',
        testPhoto: testPhoto || 'https://picsum.photos/id/91/400/300',
        testTime: new Date().toISOString(),
        assistantName: route?.assistantName || ''
      });
      console.log('[AlcoholTest] 合格记录已保存');
      Taro.showToast({ title: '检测完成，可发车', icon: 'success' });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' });
      }, 1500);
    } else {
      handleGoExceptionReport();
    }
  };

  const handleRetest = () => {
    setShowResult(false);
    setCurrentStep(2);
    setAlcoholValue('');
    setTestPhoto('');
    console.log('[AlcoholTest] 进入复测，已清空读数和读数照片');
    Taro.showToast({ title: '请等待5分钟后复测', icon: 'none' });
  };

  const handleGoExceptionReport = () => {
    const type = testResult === 'fail' ? 'over_limit' : 'over_limit';
    Taro.navigateTo({
      url: `/pages/exception-report/index?type=${type}&value=${finalValue}&plateNo=${encodeURIComponent(bus?.plateNo || '')}&routeName=${encodeURIComponent(route?.name || '')}&checkIn=${encodeURIComponent(checkInPhoto)}&test=${encodeURIComponent(testPhoto)}`
    });
  };

  const getResultClass = () => {
    if (resultValue >= 80) return 'danger';
    if (resultValue >= 20) return 'warn';
    return 'success';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View className={styles.stepCard}>
            <Text className={styles.stepTitle}>第一步：拍照签到</Text>
            <Text className={styles.stepDesc}>
              请在车辆前拍摄本人照片，用于身份确认，防止代测
            </Text>

            <View className={styles.photoArea} onClick={() => handleTakePhoto('checkIn')}>
              {checkInPhoto ? (
                <Image src={checkInPhoto} mode='aspectFill' />
              ) : (
                <>
                  <Text className={styles.uploadIcon}>📸</Text>
                  <Text className={styles.uploadText}>点击拍摄签到照片</Text>
                  <Text className={styles.uploadSub}>需清晰拍摄到面部和车牌</Text>
                </>
              )}
            </View>

            <View className={styles.tipBox}>
              <Text className={styles.tipIcon}>💡</Text>
              <Text className={styles.tipText}>
                照片将与系统档案照片进行比对，请确保证件照为近期照片。拍摄时光线充足，面部无遮挡。
              </Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View className={styles.stepCard}>
            <Text className={styles.stepTitle}>第二步：酒精检测</Text>
            <Text className={styles.stepDesc}>使用酒测仪吹气检测后，录入读数或扫码同步设备数据</Text>

            <View className={styles.inputGroup}>
              <Text className={styles.label}>酒精检测读数（mg/100ml）</Text>
              <View className={styles.inputWrap}>
                <Input
                  className={styles.numberInput}
                  type='digit'
                  value={alcoholValue}
                  onInput={(e) => setAlcoholValue(e.detail.value)}
                  placeholder='0'
                  placeholderClass={styles.inputUnit}
                />
                <Text className={styles.inputUnit}>mg/100ml</Text>
              </View>
              <View className={styles.quickBtns}>
                {['0', '5', '15', '25', '45', '80', '120', '150'].map((v) => (
                  <Button key={v} className={styles.quickBtn} onClick={() => handleQuickValue(v)}>
                    {v}
                  </Button>
                ))}
              </View>
            </View>

            <Picker
              mode='selector'
              range={['手动输入读数', '扫码同步酒测仪数据（演示）']}
              onChange={(e) => {
                if (e.detail.value === '1') {
                  Taro.showToast({ title: '扫码成功，自动填入 0 mg/100ml', icon: 'none' });
                  setAlcoholValue('0');
                }
              }}
            >
              <View className={styles.tipBox} style={{ marginBottom: 0 }}>
                <Text className={styles.tipIcon}>📱</Text>
                <Text className={styles.tipText}>
                  支持蓝牙酒测仪扫码自动同步，点击选择连接设备，避免手动录入错误。
                </Text>
              </View>
            </Picker>

            <View style={{ height: '48rpx', marginTop: '48rpx' }} />

            <Text className={styles.stepTitle}>拍摄酒测仪读数照片</Text>
            <Text className={styles.stepDesc}>拍摄酒测仪屏幕，留存读数证据</Text>

            <View className={styles.photoArea} onClick={() => handleTakePhoto('test')}>
              {testPhoto ? (
                <Image src={testPhoto} mode='aspectFill' />
              ) : (
                <>
                  <Text className={styles.uploadIcon}>📷</Text>
                  <Text className={styles.uploadText}>点击拍摄读数照片</Text>
                  <Text className={styles.uploadSub}>需清晰拍摄到酒测仪数值</Text>
                </>
              )}
            </View>
          </View>
        );

      case 3:
        return (
          <View className={styles.stepCard}>
            <Text className={styles.stepTitle}>第三步：确认检测结果</Text>
            <Text className={styles.stepDesc}>请核对以下信息，确认无误后提交完成检测</Text>

            <View className={styles.confirmBox}>
              <View className={styles.confirmRow}>
                <Text className={styles.label}>驾驶员</Text>
                <Text className={styles.value}>{mockUser.name}</Text>
              </View>
              <View className={styles.confirmRow}>
                <Text className={styles.label}>车牌号码</Text>
                <Text className={styles.value}>{bus?.plateNo || '--'}</Text>
              </View>
              <View className={styles.confirmRow}>
                <Text className={styles.label}>行驶线路</Text>
                <Text className={styles.value}>{route?.name || '--'}</Text>
              </View>
              <View className={styles.confirmRow}>
                <Text className={styles.label}>首站发车</Text>
                <Text className={styles.value}>{route?.firstStopTime || '--'}</Text>
              </View>
              <View className={styles.confirmRow}>
                <Text className={styles.label}>酒精读数</Text>
                <Text className={classnames(styles.value, styles[getResultClass()])}>
                  {alcoholValue || '0'} mg/100ml
                </Text>
              </View>
              <View className={styles.confirmRow}>
                <Text className={styles.label}>判定结果</Text>
                <Text className={classnames(styles.value, styles[getResultClass()])}>
                  {resultValue < 20
                    ? '合格（可发车）'
                    : resultValue < 80
                    ? '临界（需复测）'
                    : '超标（禁止发车）'}
                </Text>
              </View>
              <View className={styles.confirmRow}>
                <Text className={styles.label}>检测时间</Text>
                <Text className={styles.value}>{formatDateTime(new Date().toISOString())}</Text>
              </View>
            </View>

            <Text className={styles.stepTitle} style={{ marginTop: '48rpx' }}>
              留痕照片
            </Text>
            <View className={styles.confirmPhotos}>
              <View className={styles.photoItem}>
                <Image src={checkInPhoto || 'https://picsum.photos/id/177/400/300'} mode='aspectFill' />
              </View>
              <View className={styles.photoItem}>
                <Image src={testPhoto || 'https://picsum.photos/id/91/400/300'} mode='aspectFill' />
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.stepBar}>
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </View>

      <View className={styles.taskInfo}>
        <View className={styles.infoCell}>
          <Text className={styles.label}>车牌</Text>
          <Text className={styles.value}>{bus?.plateNo || '--'}</Text>
        </View>
        <View className={styles.infoCell}>
          <Text className={styles.label}>线路</Text>
          <Text className={styles.value}>{route?.name || '--'}</Text>
        </View>
        <View className={styles.infoCell}>
          <Text className={styles.label}>照管员</Text>
          <Text className={styles.value}>{route?.assistantName || '--'}</Text>
        </View>
        <View className={styles.infoCell}>
          <Text className={styles.label}>首班时间</Text>
          <Text className={styles.value}>{route?.firstStopTime || '--'}</Text>
        </View>
      </View>

      <View className={styles.content}>{renderStepContent()}</View>

      {showResult && (
        <View className={styles.resultSection}>
          <ResultCard
            result={testResult}
            alcoholValue={finalValue}
            onPrimaryAction={testResult === 'pass' ? handleResultPrimary : handleRetest}
            onSecondaryAction={testResult === 'retest' ? handleGoExceptionReport : undefined}
            primaryText={testResult === 'pass' ? '完成' : '立即复测'}
            secondaryText={testResult === 'retest' ? '上报异常' : undefined}
          />
        </View>
      )}

      {!showResult && (
        <View className={styles.bottomBar}>
          <Button className={styles.btnOutline} onClick={handlePrevStep}>
            {currentStep === 1 ? '取消' : '上一步'}
          </Button>
          <Button
            className={classnames(
              styles.btnPrimary,
              ((currentStep === 1 && !canNextStep1) || (currentStep === 2 && !canNextStep2)) &&
                styles.disabled
            )}
            onClick={handleNextStep}
          >
            {currentStep === 3 ? '提交检测结果' : '下一步'}
          </Button>
        </View>
      )}
    </View>
  );
};

export default AlcoholTestPage;
