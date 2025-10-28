const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const qs = require("qs");

const app = express();
app.use(cors());
app.use(express.json());

const vnp_TmnCode = "2QXUI4J4"; // Mã sandbox
const vnp_HashSecret = "SECRETKEYDEMO"; // Secret sandbox
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "https://halora.web.app/vnpay_return";

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

app.get("/", (req, res) => {
  res.send("✅ VNPay Server Running");
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
  const ipAddr = "0.0.0.0";

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnp_TmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: currCode,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType,
    vnp_Amount: amount * 100, // Đơn vị VNPay yêu cầu
    vnp_ReturnUrl: vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_SecureHashType: "SHA512", // ⚡ BẮT BUỘC PHẢI CÓ
  };

  vnp_Params = sortObject(vnp_Params);

  // Tạo chuỗi dữ liệu để ký
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  vnp_Params["vnp_SecureHash"] = signed;

  // Encode URL khi gửi
  const paymentUrl = `${vnp_Url}?${qs.stringify(vnp_Params, { encode: true })}`;
  res.json({ paymentUrl });
});

app.listen(3000, () => console.log("🚀 VNPay Server chạy tại http://localhost:3000"));
