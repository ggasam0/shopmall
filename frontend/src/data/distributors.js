const distributors = [
  {
    code: "gz",
    name: "广州分销商",
    pickupAddress: "广州市天河区花城大道 88 号仓储中心",
    theme: "#ff5d5d"
  },
  {
    code: "sz",
    name: "深圳分销商",
    pickupAddress: "深圳市南山区科技园 66 号配送点",
    theme: "#ff8b6f"
  },
  {
    code: "hz",
    name: "杭州分销商",
    pickupAddress: "杭州市滨江区星光大道 28 号自提站",
    theme: "#ff7a59"
  }
];

export const defaultDistributor = {
  code: "default",
  name: "默认分销商",
  pickupAddress: "请联系客户经理确认提货地址",
  theme: "#ff5d5d"
};

export const distributorMap = distributors.reduce((acc, distributor) => {
  acc[distributor.code] = distributor;
  return acc;
}, {});

export const distributorList = distributors;

export default distributorMap;
