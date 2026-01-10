AUTH_CONFIG = [
    {
        "username": "admin",
        "password": "admin123",
        "role": "admin",
        "user": {
            "name": "平台管理员",
            "phone": "13763316649",
        },
    },
    {
        "username": "dist_a",
        "password": "dist123",
        "role": "distributor",
        "user": {
            "name": "渠道分销A",
            "phone": "13800001111",
            "pickup_address": "长沙仓库：长沙市雨花区香樟路168号",
        },
    },
    {
        "username": "dist_b",
        "password": "dist456",
        "role": "distributor",
        "user": {
            "name": "渠道分销B",
            "phone": "13800002222",
            "pickup_address": "株洲仓库：株洲市天元区珠江南路88号",
        },
    },
]

SUPPLIER_CONFIG = [
    {
        "code": "a",
        "suffix": "shopa",
        "mall_name": "A供应商烟花商城",
        "distributor": {
            "code": "dist_a",
            "name": "渠道分销A",
            "pickup_address": "长沙仓库：长沙市雨花区香樟路168号",
        },
    },
    {
        "code": "b",
        "suffix": "shopbb",
        "mall_name": "B供应商烟花商城",
        "distributor": {
            "code": "dist_b",
            "name": "渠道分销B",
            "pickup_address": "株洲仓库：株洲市天元区珠江南路88号",
        },
    },
]
