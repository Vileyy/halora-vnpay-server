const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const qs = require("qs");

const app = express();
app.use(cors());
app.use(express.json());

const vnp_TmnCode = "2QXUI4J4"; // Mã terminal do VNPAY cung cấp
const vnp_HashSecret = "SECRETKEYDEMO"; // Chuỗi bí mật demo
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "https://halora.web.app/vnpay_return";

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (let key of keys) sorted[key] = obj[key];
  return sorted;
}

app.get("/", (req, res) => {
  res.send("VNPAY Payment Server Running 🚀");
});

app.post("/create-vnpay-payment", (req, res) => {
  const { amount, orderId } = req.body;

  const date = new Date();
  const createDate = `${date.getFullYear()}${("0" + (date.getMonth() + 1)).slice(-2)}${(
    "0" + date.getDate()
  ).slice(-2)}${("0" + date.getHours()).slice(-2)}${("0" + date.getMinutes()).slice(
    -2
  )}${("0" + date.getSeconds()).slice(-2)}`;

  const orderInfo = "Thanh toan don hang Halora";
  const orderType = "other";
  const locale = "vn";
  const currCode = "VND";
  const ipAddr = "127.0.0.1";

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: currCode,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType,
    vnp_Amount: amount * 100, // VNPAY yêu cầu đơn vị là đồng * 100
    vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  const paymentUrl = `${vnp_Url}?${qs.stringify(vnp_Params, { encode: false })}`;
  res.json({ paymentUrl });
});

app.listen(3000, () => console.log("🚀 Server chạy tại http://localhost:3000"));
