import { useState } from 'react';
import styles from './Tutorial.module.css';

export function Tutorial() {
  const [show, setShow] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button className={styles.toggle} onClick={() => setShow(!show)}>
        {show ? '▼ 隐藏帮助' : '▶ 使用帮助'}
      </button>
      {show && (
        <div className={styles.content}>
          <p>本工具帮助你在《星战前夜：无烬星河》中计算工业项目的投入产出比。</p>
          <p><strong>使用步骤：</strong></p>
          <ol>
            <li>在顶部「技能和设施」中设置你的角色技能等级</li>
            <li>在左侧选择制造或逆向工程项目</li>
            <li>选择产品和对应的解码器</li>
            <li>在材料清单中填入各种材料的单价</li>
            <li>在「折扣配置」中设置全局折扣规则（如矿物 7 折）</li>
            <li>点击「发送到出售」，在右侧输入售价查看利润</li>
          </ol>
          <p><strong>计算公式说明：</strong></p>
          <ul>
            <li>材料效率 = 150% + 技能加成 + 设施加成 + 解码器加成</li>
            <li>时间消耗 = 基础时间 × (1+技能) × (1+设施) × (1+解码器)</li>
            <li>成功率 = 基础成功率 × (1+技能+设施+解码器)，上限 100%</li>
            <li>折扣优先级：手动覆写 &gt; 材料清单 &gt; 全局规则</li>
          </ul>
        </div>
      )}
    </div>
  );
}
