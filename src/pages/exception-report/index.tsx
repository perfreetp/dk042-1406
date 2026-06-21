import React, { useState } from 'react';
import { View, Text, Image, Textarea, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import useAppStore from '@/store';
import { mockUser } from '@/data/mockUser';
import type { ExceptionType } from '@/types';
import { getExceptionTypeText, formatDateTime } from '@/utils';

const TYPES: { key: ExceptionType; name: string; desc: string }[] = [
  { key: 'over_limit', name: '酒精超标', desc: '检测读数超过标准值' },
  { key: 'device_error', name: '设备故障', desc: '酒测仪无法正常使用' },
  { key: 'timeout', name: '未按时检测', desc: '超过发车时间未完成检测' },
  { key: 'other', name: '其他异常', desc: '其他需要上报的情况' }
];

const ExceptionReportPage: React.FC = () => {
  const router = useRouter();
  const initType = (router.params.type as ExceptionType) || 'other';
  const initValue = router.params.value ? parseFloat(router.params.value) : undefined;
  const initCheckIn = router.params.checkIn ? decodeURIComponent(router.params.checkIn) : '';
  const initTest = router.params.test ? decodeURIComponent(router.params.test) : '';
  const initPlateNo = router.params.plateNo ? decodeURIComponent(router.params.plateNo) : '';
  const initRouteName = router.params.routeName ? decodeURIComponent(router.params.routeName) : '';
  const addExceptionRecord = useAppStore((s) => s.addExceptionRecord);

  const [exceptionType, setExceptionType] = useState<ExceptionType>(initType);
  const [remark, setRemark] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>(() => {
    const arr: string[] = [];
    if (initCheckIn) arr.push(initCheckIn);
    if (initTest) arr.push(initTest);
    return arr;
  });

  const maxWords = 200;
  const canSubmit = exceptionType && remark.trim().length >= 10 && photos.length > 0;

  const handleAddPhoto = async () => {
    if (photos.length >= 6) {
      Taro.showToast({ title: '最多上传6张照片', icon: 'none' });
      return;
    }
    try {
      const res = await Taro.chooseImage({
        count: 6 - photos.length,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album']
      });
      const newPhotos = res.tempFilePaths.length > 0
        ? res.tempFilePaths
        : [`https://picsum.photos/id/${Math.floor(Math.random() * 50) + 100}/300/300`];
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 6));
      console.log('[ExceptionReport] 上传照片', { count: newPhotos.length });
    } catch (err) {
      console.error('[ExceptionReport] 拍照失败', err);
      if (photos.length < 6) {
        setPhotos((prev) => [...prev, `https://picsum.photos/id/${100 + prev.length}/300/300`].slice(0, 6));
      }
    }
  };

  const handleDeletePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!exceptionType) {
      Taro.showToast({ title: '请选择异常类型', icon: 'none' });
      return;
    }
    if (remark.trim().length < 10) {
      Taro.showToast({ title: '请详细说明原因（至少10字）', icon: 'none' });
      return;
    }
    if (photos.length === 0) {
      Taro.showToast({ title: '请至少上传一张现场照片', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认提交',
      content: '异常上报后将自动通知值班安全员，安全员将进行后续处理，您无法自行修改为通过状态。是否确认提交？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });
          setTimeout(() => {
            const recordId = addExceptionRecord({
              type: exceptionType,
              driverName: mockUser.name,
              plateNo: initPlateNo,
              routeName: initRouteName,
              remark: remark.trim(),
              photos,
              alcoholValue: initValue,
              checkInPhoto: initCheckIn || undefined,
              testPhoto: initTest || undefined
            });
            console.log('[ExceptionReport] 提交异常上报完成', { recordId, type: exceptionType });
            Taro.hideLoading();
            Taro.showToast({ title: '已通知安全员', icon: 'success' });
            setTimeout(() => {
              Taro.switchTab({ url: '/pages/home/index' });
            }, 1500);
          }, 1200);
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.content}>
        <View className={styles.warningBanner}>
          <View className={styles.icon}>!</View>
          <View className={styles.textBox}>
            <Text className={styles.title}>异常情况需上报安全员</Text>
            <Text className={styles.desc}>
              根据安全管理规定，出现酒精超标、设备故障等异常时，必须如实上报。上报后值班安全员会收到提醒并处理，您不能自行修改检测结果为通过。
            </Text>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>选择异常类型</Text>
          <View className={styles.typeList}>
            {TYPES.map((t) => (
              <View
                key={t.key}
                className={classnames(styles.typeItem, exceptionType === t.key && styles.active)}
                onClick={() => setExceptionType(t.key)}
              >
                <View
                  className={classnames(styles.typeRadio, exceptionType === t.key && styles.active)}
                >
                  {exceptionType === t.key && <View className={styles.dot} />}
                </View>
                <View className={styles.typeContent}>
                  <Text className={styles.name}>{t.name}</Text>
                  <Text className={styles.desc}>{t.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>基本信息</Text>
          <View className={styles.infoSummary}>
            <View className={styles.row}>
              <Text className={styles.label}>驾驶员</Text>
              <Text className={styles.value}>{mockUser.name}</Text>
            </View>
            <View className={styles.row}>
              <Text className={styles.label}>车牌号码</Text>
              <Text className={styles.value}>{initPlateNo || '未选择'}</Text>
            </View>
            <View className={styles.row}>
              <Text className={styles.label}>行驶线路</Text>
              <Text className={styles.value}>{initRouteName || '未选择'}</Text>
            </View>
            <View className={styles.row}>
              <Text className={styles.label}>异常类型</Text>
              <Text className={styles.value}>{getExceptionTypeText(exceptionType)}</Text>
            </View>
            {initValue !== undefined && (
              <View className={styles.row}>
                <Text className={styles.label}>酒精读数</Text>
                <Text
                  className={classnames(
                    styles.value,
                    initValue >= 80 ? styles.danger : initValue >= 20 ? styles.warn : ''
                  )}
                >
                  {initValue} mg/100ml
                </Text>
              </View>
            )}
            <View className={styles.row}>
              <Text className={styles.label}>上报时间</Text>
              <Text className={styles.value}>{formatDateTime(new Date().toISOString())}</Text>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>
              原因说明
              <Text className={styles.count}>
                {remark.length}/{maxWords}
              </Text>
            </Text>
            <Textarea
              className={styles.textarea}
              value={remark}
              onInput={(e) => setRemark(e.detail.value.slice(0, maxWords))}
              placeholder='请详细说明异常原因，便于安全员了解情况。例如：昨晚聚餐，今晨仍有酒精残留，自觉状态良好但仪器测出35mg/100ml...'
              maxlength={maxWords}
              autoHeight
            />
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>
              现场照片（最多6张）
            </Text>
            <View className={styles.photoGrid}>
              {photos.map((p, idx) => (
                <View key={idx} className={styles.photoItem}>
                  <Image src={p} mode='aspectFill' />
                  <View className={styles.delete} onClick={() => handleDeletePhoto(idx)}>
                    ×
                  </View>
                </View>
              ))}
              {photos.length < 6 && (
                <View className={styles.photoItem} onClick={handleAddPhoto}>
                  <View className={styles.photoUpload}>
                    <Text className={styles.icon}>+</Text>
                    <Text className={styles.text}>添加照片</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={styles.btnCancel}
          onClick={() => {
            Taro.navigateBack();
          }}
        >
          取消
        </Button>
        <Button
          className={classnames(styles.btnSubmit, !canSubmit && styles.disabled)}
          onClick={handleSubmit}
        >
          提交上报
        </Button>
      </View>
    </View>
  );
};

export default ExceptionReportPage;
