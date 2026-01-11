ADMIN_USER = {
    "name": "平台管理员",
    "phone": "13763316649",
}

DISTRIBUTOR_USERS = {
    "luowen": {
        "name": "罗文烟花商城",
        "phone": "15915750677",
        "pickup_address": "广州市花都区赤坭镇丰群村委会旁",
    },
    "chengtian": {
        "name": "承天烟花商城",
        "phone": "13924004222",
        "pickup_address": "广州市花都区赤坭镇三和庄祠堂旁",
    },
}

AUTH_CONFIG = [
    {
        "username": "jason",
        "password": "jason123",
        "role": "admin",
        "user": ADMIN_USER,
    },
    {
        "username": "luowen",
        "password": "luowen123",
        "role": "distributor",
        "user": DISTRIBUTOR_USERS["luowen"],
    },
    {
        "username": "chengtian",
        "password": "chengtian123",
        "role": "distributor",
        "user": DISTRIBUTOR_USERS["chengtian"],
    },
]

SUPPLIER_CONFIG = [
    {
        "code": "a",
        "suffix": "shopa",
        "mall_name": "罗文烟花商城",
        "distributor": {
            "code": "dist_a",
            "name": DISTRIBUTOR_USERS["luowen"]["name"],
            "pickup_address": DISTRIBUTOR_USERS["luowen"]["pickup_address"],
        },
    },
    {
        "code": "b",
        "suffix": "shopb",
        "mall_name": "承天烟花商城",
        "distributor": {
            "code": "dist_b",
            "name": DISTRIBUTOR_USERS["chengtian"]["name"],
            "pickup_address": DISTRIBUTOR_USERS["chengtian"]["pickup_address"],
        },
    },
]