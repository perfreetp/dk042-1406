import React, { useState, useMemo } from 'react';
import { View, Text, Image, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import useAppStore from '@/store';
import type { SafetyNotice, HandleResult } from '@/types';
import { formatDateTime, getExceptionTypeText, getHandleResultText } from '@/utils';

type FilterType = 'all' | 'pending' | 'handled';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'handled', label: '已处理' }
];

const HANDLE_RESULTS: { key: HandleResult; name: string }[] = [
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

  const canSubmitHandle = handleRemark.trim().length >= 5;

  const openHandleModal = (notice: SafetyNotice) => {
    if (notice.handled) return;
    setActiveNotice(notice);
    setHandleResult('retest_pass');
    setHandleRemark('');
    setShowModal(true);
    console.log('[SafetyNotice] 打开处理弹窗', notice.id);
  };

  const closeHandleModal = () => {
    setShowModal(false);
    setActiveNotice(null);
  };

  const handleSubmitHandle = () => {
    if (!activeNotice) return;
    if (handleRemark.trim().length < 5) {
      return;
    }
    handleSafetyNotice({
      noticeId: activeNotice.id,
      handlerName: '安全员-刘主管',
      handleResult,
      handleRemark: handleRemark.trim()
    });
    console.log('[SafetyNotice] 提交处理', { noticeId: activeNotice.id, handleResult });
    Taro.showToast({ title: '处理完成', icon: 'success' });
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
          <View className={styles.modalContent} catchMove>
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
              </Text>
              <View className={styles.resultOptions}>
                {HANDLE_RESULTS.map((r) => (
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
