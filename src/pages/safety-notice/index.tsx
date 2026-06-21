import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockSafetyNotices } from '@/data/mockRecords';
import type { SafetyNotice } from '@/types';
import { formatDateTime, getExceptionTypeText } from '@/utils';

type FilterType = 'all' | 'pending' | 'handled';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'handled', label: '已处理' }
];

const SafetyNoticePage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');

  const stats = useMemo(() => {
    const total = mockSafetyNotices.length;
    const pending = mockSafetyNotices.filter((n) => !n.handled).length;
    const handled = mockSafetyNotices.filter((n) => n.handled).length;
    return { total, pending, handled };
  }, []);

  const filteredList = useMemo<SafetyNotice[]>(() => {
    if (filter === 'all') return mockSafetyNotices;
    if (filter === 'pending') return mockSafetyNotices.filter((n) => !n.handled);
    return mockSafetyNotices.filter((n) => n.handled);
  }, [filter]);

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

              {notice.handled && notice.handlerName && (
                <View className={styles.handleInfo}>
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
    </View>
  );
};

export default SafetyNoticePage;
