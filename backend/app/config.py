CONFIG = {
    "admin": {
        "username": "jason",
        "password": "jason123",
        "user": {
            "name": "平台管理员",
            "phone": "13763316649",
        },
    },
    "suppliers": [
        {
            "code": "a",
            "suffix": "shopa",
            "mall_name": "罗文烟花商城",
            "distributor": {
                "code": "dist_a",
                "name": "罗文烟花商城",
                "phone": "15915750677",
                "pickup_address": "广州市花都区赤坭镇丰群村委会旁",
                "username": "luowen",
                "password": "luowen123",
            },
        },
        {
            "code": "b",
            "suffix": "shopb",
            "mall_name": "承天烟花商城",
            "distributor": {
                "code": "dist_b",
                "name": "承天烟花商城",
                "phone": "13924004222",
                "pickup_address": "广州市花都区赤坭镇三和庄祠堂旁",
                "username": "chengtian",
                "password": "chengtian123",
            },
        },
    ],
}

AUTH_CONFIG = [
    {
        "username": CONFIG["admin"]["username"],
        "password": CONFIG["admin"]["password"],
        "role": "admin",
        "user": CONFIG["admin"]["user"],
    },
    *[
        {
            "username": supplier["distributor"]["username"],
            "password": supplier["distributor"]["password"],
            "role": "distributor",
            "user": {
                "name": supplier["distributor"]["name"],
                "phone": supplier["distributor"]["phone"],
                "pickup_address": supplier["distributor"]["pickup_address"],
            },
        }
        for supplier in CONFIG["suppliers"]
    ],
]

SUPPLIER_CONFIG = [
    {
        "code": supplier["code"],
        "suffix": supplier["suffix"],
        "mall_name": supplier["mall_name"],
        "distributor": {
            "code": supplier["distributor"]["code"],
            "name": supplier["distributor"]["name"],
            "pickup_address": supplier["distributor"]["pickup_address"],
        },
    }
    for supplier in CONFIG["suppliers"]
]

DISTRIBUTOR_CODE_BY_USERNAME = {
    supplier["distributor"]["username"]: supplier["distributor"]["code"]
    for supplier in CONFIG["suppliers"]
}
