import React, { useState, useMemo } from 'react';
import { View, Text, Image, Textarea, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import useAppStore from '@/store';
import type { SafetyNotice, HandleResult } from '@/types';
import {
  formatDateTime,
  getExceptionTypeText,
  getHandleResultText,
  getDefaultHandleResult,
  getRecommendedActions
} from '@/utils';

type FilterType = 'all' | 'pending' | 'handled';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'handled', label: '已处理' }
];

const ALL_HANDLE_RESULTS: { key: HandleResult; name: string }[] = [
  { key: 'retest_pass', name: '已复测放行' },
  { key: 'replace_driver', name: '安排替班' },
  { key: 'device_replaced', name: '设备已更换' },
  { key: 'other', name: '其他处理' }
];

const SafetyNoticePage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const safetyNotices = useAppStore((s) => s.safetyNotices);
  const handleSafetyNotice = useAppStore((s) => s.handleSafetyNotice);

  const [showModal, setShowModal] = useState(false);
  const [activeNotice, setActiveNotice] = useState<SafetyNotice | null>(null);
  const [handleResult, setHandleResult] = useState<HandleResult>('retest_pass');
  const [handleRemark, setHandleRemark] = useState('');
  const [retestValue, setRetestValue] = useState('');
  const [retestPhoto, setRetestPhoto] = useState<string>('');

  const stats = useMemo(() => {
    const total = safetyNotices.length;
    const pending = safetyNotices.filter((n) => !n.handled).length;
    const handled = safetyNotices.filter((n) => n.handled).length;
    return { total, pending, handled };
  }, [safetyNotices]);

  const filteredList = useMemo<SafetyNotice[]>(() => {
    if (filter === 'all') return safetyNotices;
    if (filter === 'pending') return safetyNotices.filter((n) => !n.handled);
    return safetyNotices.filter((n) => n.handled);
  }, [filter, safetyNotices]);

  const recommendedResults = useMemo<{ key: HandleResult; name: string }[]>(() => {
    if (!activeNotice) return ALL_HANDLE_RESULTS;
    const recKeys = getRecommendedActions(activeNotice.exceptionType);
    return ALL_HANDLE_RESULTS.filter((r) => recKeys.includes(r.key));
  }, [activeNotice]);

  const canSubmitHandle = useMemo(() => {
    if (!handleRemark.trim() || handleRemark.trim().length < 5) return false;
    if (handleResult === 'retest_pass') {
      const v = parseFloat(retestValue);
      if (isNaN(v) || v < 0) return false;
      if (!retestPhoto) return false;
    }
    return true;
  }, [handleRemark, handleResult, retestValue, retestPhoto]);

  const openHandleModal = (notice: SafetyNotice) => {
    if (notice.handled) return;
    setActiveNotice(notice);
    setHandleResult(getDefaultHandleResult(notice.exceptionType));
    setHandleRemark('');
    setRetestValue('');
    setRetestPhoto('');
    setShowModal(true);
    console.log('[SafetyNotice] 打开处理弹窗', notice.id, {
      defaultResult: getDefaultHandleResult(notice.exceptionType)
    });
  };

  const closeHandleModal = () => {
    setShowModal(false);
    setActiveNotice(null);
  };

  const handleModalContentClick = (e: any) => {
    e.stopPropagation && e.stopPropagation();
  };

  const handleAddRetestPhoto = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album']
      });
      const p = res.tempFilePaths[0] || `https://picsum.photos/id/${Math.floor(Math.random() * 50) + 100}/400/300`;
      setRetestPhoto(p);
      console.log('[SafetyNotice] 复测照片', p);
    } catch (err) {
      console.error('[SafetyNotice] 拍照失败', err);
      setRetestPhoto(`https://picsum.photos/id/${Math.floor(Math.random() * 50) + 100}/400/300`);
    }
  };

  const handleQuickRetest = (val: string) => {
    setRetestValue(val);
  };

  const handleSubmitHandle = () => {
    if (!activeNotice || !canSubmitHandle) return;
    const payload: Parameters<typeof handleSafetyNotice>[0] = {
      noticeId: activeNotice.id,
      handlerName: '安全员-刘主管',
      handleResult,
      handleRemark: handleRemark.trim()
    };
    if (handleResult === 'retest_pass') {
      payload.retestValue = parseFloat(retestValue);
      if (retestPhoto) payload.retestPhoto = retestPhoto;
    }
    handleSafetyNotice(payload);
    console.log('[SafetyNotice] 提交处理', {
      noticeId: activeNotice.id,
      handleResult,
      retestValue: payload.retestValue,
      hasRetestPhoto: !!payload.retestPhoto
    });
    Taro.showToast({ title: '待主管确认', icon: 'success' });
    closeHandleModal();
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.num}>{stats.total}</Text>
            <Text className={styles.label}>总通知</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.num, styles.warn)}>{stats.pending}</Text>
            <Text className={styles.label}>待处理</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.num, styles.success)}>{stats.handled}</Text>
            <Text className={styles.label}>已处理</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterTabs}>
        {FILTERS.map((f) => (
          <View
            key={f.key}
            className={classnames(styles.tab, filter === f.key && styles.active)}
            onClick={() => setFilter(f.key)}
          >
            <Text>{f.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.content}>
        {filteredList.length > 0 ? (
          filteredList.map((notice) => (
            <View
              key={notice.id}
              className={classnames(styles.noticeCard, notice.handled && styles.handled)}
            >
              <View className={styles.cardHeader}>
                <View className={styles.headerInfo}>
                  <Text className={styles.driverText}>
                    {notice.driverName} · {notice.plateNo}
                  </Text>
                  <Text className={styles.routeText}>{notice.routeName}</Text>
                </View>
                <View
                  className={classnames(
                    styles.statusTag,
                    notice.handled ? styles.handled : styles.pending
                  )}
                >
                  {notice.handled ? '已处理' : '待处理'}
                </View>
              </View>

              <View className={styles.typeTag}>
                {getExceptionTypeText(notice.exceptionType)}
              </View>

              <View className={styles.infoGrid}>
                <View className={styles.row}>
                  <Text className={styles.label}>上报时间</Text>
                  <Text className={styles.value}>{formatDateTime(notice.createTime)}</Text>
                </View>
                {notice.alcoholValue !== undefined && (
                  <View className={styles.row}>
                    <Text className={styles.label}>酒精值</Text>
                    <Text
                      className={classnames(
                        styles.value,
                        notice.alcoholValue >= 80
                          ? styles.danger
                          : notice.alcoholValue >= 20
                          ? styles.warn
                          : ''
                      )}
                    >
                      {notice.alcoholValue} mg/100ml
                    </Text>
                  </View>
                )}
              </View>

              <View className={styles.remarkBox}>
                <Text className={styles.label}>异常说明</Text>
                <Text className={styles.text}>{notice.exceptionRemark}</Text>
              </View>

              {notice.photos.length > 0 && (
                <View className={styles.photos}>
                  {notice.photos.map((p, idx) => (
                    <View key={idx} className={styles.photo}>
                      <Image src={p} mode='aspectFill' />
                    </View>
                  ))}
                </View>
              )}

              {notice.handled ? (
                <View className={styles.handleInfo}>
                  {notice.handleResult && (
                    <View className={styles.handleResultTag}>
                      {getHandleResultText(notice.handleResult)}
                    </View>
                  )}
                  {notice.handleResult === 'retest_pass' && notice.retestValue !== undefined && (
                    <View className={styles.row}>
                      <Text className={styles.label}>复测值</Text>
                      <Text className={classnames(styles.value, notice.retestValue < 20 ? styles.success : '')}>
                        {notice.retestValue} mg/100ml
                      </Text>
                    </View>
                  )}
                  {notice.handleResult === 'retest_pass' && notice.retestPhoto && (
                    <View style={{ marginBottom: 16 }}>
                      <Text className={styles.label} style={{ display: 'block', marginBottom: 8 }}>
                        复测照片
                      </Text>
                      <Image
                        src={notice.retestPhoto}
                        mode='aspectFill'
                        style={{ width: 200, height: 150, borderRadius: 8 }}
                      />
                    </View>
                  )}
                  <View className={styles.row}>
                    <Text className={styles.label}>处理人</Text>
                    <Text className={styles.value}>{notice.handlerName}</Text>
                  </View>
                  {notice.handleTime && (
                    <View className={styles.row}>
                      <Text className={styles.label}>处理时间</Text>
                      <Text className={styles.value}>{formatDateTime(notice.handleTime)}</Text>
                    </View>
                  )}
                  {notice.handleRemark && (
                    <View className={styles.remark}>{notice.handleRemark}</View>
                  )}
                </View>
              ) : (
                <Button className={styles.handleBtn} onClick={() => openHandleModal(notice)}>
                  立即处理
                </Button>
              )}
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.icon}>🛡️</Text>
            <Text className={styles.text}>暂无相关通知</Text>
          </View>
        )}
      </View>

      {showModal && activeNotice && (
        <View className={styles.modalMask} onClick={closeHandleModal}>
          <View className={styles.modalContent} onClick={handleModalContentClick}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>处理异常通知</Text>
              <Text className={styles.modalClose} onClick={closeHandleModal}>
                ×
              </Text>
            </View>

            <View className={styles.modalSection}>
              <Text className={styles.modalLabel}>司机与车牌</Text>
              <Text style={{ fontSize: 24, color: '#64748B' }}>
                {activeNotice.driverName} · {activeNotice.plateNo}
              </Text>
            </View>

            <View className={styles.modalSection}>
              <Text className={styles.modalLabel}>异常类型</Text>
              <View className={styles.typeTag}>
                {getExceptionTypeText(activeNotice.exceptionType)}
              </View>
            </View>

            <View className={styles.modalSection}>
              <Text className={styles.modalLabel}>
                处理结果 <Text style={{ color: '#EF4444' }}>*</Text>
                <Text style={{ fontSize: 22, color: '#94A3B8', marginLeft: 12 }}>
                  已按异常类型推荐
                </Text>
              </Text>
              <View className={styles.resultOptions}>
                {recommendedResults.map((r) => (
                  <View
                    key={r.key}
                    className={classnames(
                      styles.resultOption,
                      handleResult === r.key && styles.active
                    )}
                    onClick={() => setHandleResult(r.key)}
                  >
                    <Text className={styles.resultName}>{r.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {handleResult === 'retest_pass' && (
              <>
                <View className={styles.modalSection}>
                  <Text className={styles.modalLabel}>
                    复测读数（mg/100ml）<Text style={{ color: '#EF4444' }}>*</Text>
                  </Text>
                  <View style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Input
                      type='digit'
                      value={retestValue}
                      onInput={(e) => setRetestValue(e.detail.value)}
                      placeholder='0'
                      style={{
                        flex: 1,
                        height: 72,
                        background: '#F1F5F9',
                        borderRadius: 12,
                        padding: '0 24rpx',
                        fontSize: 32,
                        color: '#0F172A'
                      }}
                    />
                    <Text style={{ fontSize: 24, color: '#64748B' }}>mg/100ml</Text>
                  </View>
                  <View style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                    {['0', '5', '12', '18', '25', '35'].map((v) => (
                      <Button
                        key={v}
                        onClick={() => handleQuickRetest(v)}
                        style={{
                          width: 90,
                          height: 56,
                          borderRadius: 999,
                          background: '#F1F5F9',
                          color: '#475569',
                          fontSize: 24,
                          padding: 0,
                          lineHeight: '56rpx',
                          margin: 0
                        }}
                      >
                        {v}
                      </Button>
                    ))}
                  </View>
                </View>

                <View className={styles.modalSection}>
                  <Text className={styles.modalLabel}>
                    复测读数照片
                    <Text style={{ color: '#EF4444' }}>*</Text>
                    <Text style={{ fontSize: 22, color: '#94A3B8', marginLeft: 12 }}>
                      必须上传真实照片，无自动占位
                    </Text>
                  </Text>
                  {retestPhoto ? (
                    <View style={{ position: 'relative' }}>
                      <Image
                        src={retestPhoto}
                        mode='aspectFill'
                        style={{ width: 280, height: 210, borderRadius: 12 }}
                      />
                      <View
                        onClick={() => setRetestPhoto('')}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          background: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 32
                        }}
                      >
                        ×
                      </View>
                    </View>
                  ) : (
                    <View
                      onClick={handleAddRetestPhoto}
                      style={{
                        width: 280,
                        height: 210,
                        borderRadius: 12,
                        border: '2rpx dashed #CBD5E1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94A3B8',
                        fontSize: 24,
                        gap: 8
                      }}
                    >
                      <Text style={{ fontSize: 56 }}>📷</Text>
                      <Text>点击上传复测照片</Text>
                    </View>
                  )}
                </View>
              </>
            )}

            <View className={styles.modalSection}>
              <Text className={styles.modalLabel}>
                处理意见 <Text style={{ color: '#EF4444' }}>*</Text>
                <Text style={{ fontSize: 22, color: '#94A3B8', marginLeft: 12 }}>
                  至少5字
                </Text>
              </Text>
              <Textarea
                className={styles.modalTextarea}
                value={handleRemark}
                onInput={(e) => setHandleRemark(e.detail.value.slice(0, 200))}
                placeholder='请填写处理意见，例如：已现场监督复测，复测值8mg/100ml，合格放行'
                maxlength={200}
                autoHeight
              />
            </View>

            <View className={styles.modalActions}>
              <Button className={styles.modalBtnCancel} onClick={closeHandleModal}>
                取消
              </Button>
              <Button
                className={classnames(
                  styles.modalBtnConfirm,
                  !canSubmitHandle && styles.disabled
                )}
                onClick={handleSubmitHandle}
              >
                确认处理
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SafetyNoticePage;
