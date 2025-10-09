const mongoose = require('mongoose');
const crypto = require('crypto');
const { Schema } = mongoose;

const folderSchema = Schema(
  {
    name: { type: String, unique: true },
  },
  { timestamps: true }
);

const Folder = mongoose.model('Folder', folderSchema);

const algorithm = "aes-256-cbc";
const plaintext_bytes = (new TextEncoder()).encode("97ad0f1e10576ec94f0482fa45bf5629");	
const encryptText = async (text) => {
  const iv = crypto.randomBytes(16);  // 16-byte IV
  const cipher = crypto.createCipheriv(algorithm, plaintext_bytes, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};
const itemSchema = Schema(
  {
    folderUid: { type: Schema.Types.ObjectId, ref: 'Folder' },
    title: { type: String, unique: true },
    username: String,
    password: String,
    otherFields: Object,
    sensitiveKeys: [String],
  },
  { timestamps: true }
);
const encryptSensitiveFieldsOfItem = async (item) => {
  if (item.password) {
    item.password = await encryptText(item.password);
  }
  const otherFieldKeys = Object.keys(item.otherFields || {});
  for (let a = 0; a < otherFieldKeys.length; a++) {
    const ofK = otherFieldKeys[a];
    if (item.sensitiveKeys.indexOf(ofK) > -1) {
      if (item.otherFields[ofK]) {
        item.otherFields[ofK] = await encryptText(item.otherFields[ofK]);
      }
    }
  }
};
/**
 * Password hash middleware.
 */
itemSchema.pre('save', async function(next) { //create item
  const item = this;
  await encryptSensitiveFieldsOfItem(item);
  next();
});
itemSchema.pre('findOneAndUpdate', async function(next) { //update item
  const item = this.getUpdate();
  await encryptSensitiveFieldsOfItem(item);
  next();
});
const Item = mongoose.model('Item', itemSchema);





const allItems = [
	{
		folder: "Sankar-Personal-Financials",
		title: "Department of Post",
		username: "354045396",
		password: "PostSaAn@1491",
		otherFields: {
			"IFSC": "IPOS0000DOP",
			"Savings Account Number": "4309806196",
			"Customer ID": "354045396",
			"NetBanking Login URL": "https://ebanking.indiapost.gov.in",
			"Transaction Password": "PostSaAn@1491Tran"
		},
		sensititveKeys: [
			"Transaction Password"
		]
	},
	{
		folder: "Sankar-Personal-Financials",
		title: "Federal Bank",
		username: "TNSankar",
		password: "FedSaAn@91",
		otherFields: {
			"IFSC": "FDRL0001150",
			"Savings Account Number": "11500100218557",
			"Debit Card Number": "5559426520973752",
			"Debit Card Expiry": "07/26    -    July 2026",
			"Debit Card CVV": "315",
			"Debit Card Name": "SANKARANANDH T N",
			"Debit Card PIN": "3928",
			"Customer ID": "25682803",
			"Transaction Password": "FedSaAn@91Tran",
			"Fed Mobile Login PIN": "1991",
		},
		sensititveKeys: [
			"Transaction Password",
			"Debit Card PIN",
			"Debit Card CVV"
		]
	},
	{
		folder: "Sankar-Personal-Financials",
		title: "Equitas Small Finance Bank",
		username: "TNSankar",
		password: "EquSaAn@141191",
		otherFields: {
			"IFSC": "ESFB0001113",
			"Savings Account Number": "100036585236",
			"Debit Card Number": "4723571114858549",
			"Debit Card Expiry": "04/23    -    April 2023",
			"Debit Card CVV": "263",
			"Debit Card Name": "T N SANKARANANDH",
			"Debit Card PIN": "3928",
			"Customer ID": "11793259",
			"Mobile Banking PIN": "3928",
		},
		sensititveKeys: [
			"Mobile Banking PIN",
			"Debit Card PIN",
			"Debit Card CVV"
		]
	},
	{
		folder: "Sankar-Personal-Financials",
		title: "SBM Bank - Niyo Global",
		username: "",
		password: "",
		otherFields: {
			"IFSC": "STCB0000065",
			"Savings Account Number": "20012203960984",
			"Debit Card Number": "46451601000581359",
			"Debit Card Expiry": "08/26    -    August 2026",
			"Debit Card CVV": "273",
			"Debit Card Name": "THANTHULLU SANKARANANDH",
			"Debit Card PIN": "3928",
			"Customer ID": "R006670469",
			"Mobile Banking PIN": "172839",
			"Niyo Global Login Passcode": "392839",
		},
		sensititveKeys: [
			"Mobile Banking PIN",
			"Debit Card PIN",
			"Debit Card CVV",
			"Niyo Global Login Passcode"
		]
	},
	{
		folder: "Sankar-Personal-Financials",
		title: "HDFC Bank",
		username: "209326041",
		password: "HdfSaAn@1491",
		otherFields: {
			"IFSC": "HDFC0002409",
			"Savings Account Number": "50100557007591",
			"Debit Card Number": "4160211531035294",
			"Debit Card Expiry": "09/27    -    September 2027",
			"Debit Card CVV": "933",
			"Debit Card Name": "",
			"Debit Card PIN": "3928",
			"Customer ID": "209326041",
			"Mobile Banking PIN": "3939",
		},
		sensititveKeys: [
			"Mobile Banking PIN",
			"Debit Card PIN",
			"Debit Card CVV",
		]
	},
	{
		folder: "Sankar-Personal-Financials",
		title: "CS Happay Card",
		username: "9042495512",
		password: "HapSaAn@1491",
		otherFields: {
			"Debit Card Number": "4661300600219667",
			"Debit Card Expiry": "07/28    -    July 2028",
			"Debit Card CVV": "185",
			"Debit Card PIN": "3928",
		},
		sensititveKeys: [
			"Debit Card PIN",
			"Debit Card CVV",
		]
	},
	{
		folder: "Sankar-Personal-Financials",
		title: "IDFC First Bank",
		username: "TN_Sankar",
		password: "IdfSaAn@1411912",
		otherFields: {
			"IFSC": "IDFB0080551",
			"Savings Account Number": "10127344864",
			"Debit Card Number": "4011384607304059",
			"Debit Card Expiry": "07/28    -    July 2028",
			"Debit Card CVV": "783",
			"Debit Card Name": "",
			"Debit Card Type": "Platinum",
			"Debit Card PIN": "3928",
			"Customer ID": "5762451280",
			"Mobile Banking PIN": "1991",
			"Anumati User ID": "9042495512@anumati",
			"Anumati Login PIN": "3928",
			"First WOW Credit Card Application Number": "409726158",
			"First WOW Credit Card Number": "4405232019437021",
			"First WOW Credit Card Expiry": "03/27    -    March 2027",
			"First WOW Credit Card CVV": "336",
			"First WOW Credit Card Name": "T N SANKAR ANANDH",
			"First WOW Credit Card FD Tenure": "367 days",
			"First WOW Credit Card FD Interest Rate": "7.2500%",
			"First WOW Credit Card FD Number": "10127629747",
		},
		sensititveKeys: [
			"Debit Card CVV",
			"Debit Card PIN",
			"Mobile Banking PIN",
			"Anumati Login PIN",
			"First WOW Credit Card CVV",
		]
	},
	{
		folder: "Sankar-Personal-Financials",
		title: "EPF - UAN",
		username: "100379474643",
		password: "UanSaAn@141191",
		otherFields: {
			"EPF UAN Login URL": "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
			"Member Passbook Login URL": "https://passbook.epfindia.gov.in/MemberPassBook/login",
			"Employee's Provident Fund Organisation Service List Link": "https://www.epfindia.gov.in/site_en/For_Employees.php"
		},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Financials",
		title: "LIC Policy - Krishiv",
		username: "9042495512",
		password: "LicSankar@1491",
		otherFields: {
			"LIC Policy Login": "https://ebiz.licindia.in/D2CPM/#Login",
		},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Financials",
		title: "LIC Housing Loan",
		username: "22126289",
		password: "LicSaAn@141191",
		otherFields: {
			"LIC HFL Login": "https://customer.lichousing.com/login.php",
			"Loan Account Number": "540800005215",
		},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-IDCards",
		title: "Digi Locker",
		username: "TN_Sankar",
		password: "Sankar@91",
		otherFields: {
			"Email ID": "tnsankaranandh@gmail.com"
		},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-IDCards",
		title: "Voter ID",
		username: "",
		password: "",
		otherFields: {
			"Voter ID Number": "ZBK0824268"
		},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-IDCards",
		title: "Aadhaar Card Sankar",
		username: "556942263231",
		password: "",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-IDCards",
		title: "PAN Card Sankar",
		username: "DOAPS2626H",
		password: "ItrSaAn@1191",
		otherFields: {
			"Income Tax Login URL": "https://eportal.incometax.gov.in/iec/foservices/#/login"
		},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-IDCards",
		title: "Passport",
		username: "K9965829",
		password: "",
		otherFields: {
			"File Number": "MD1061849114113",
			"Issue Date": "04/04/2013",
			"Expiry Date": "03/04/2023",
			"Name of Father / Legal Fuardian": "NARENDRAN",
			"Name of Mother": "VENKATALAKSHMI",
			"Type": "P",
			"Country Code": "IND",
			"Surname": "THANTHULLU NARENDRAN",
			"Given Name(s)": "SANKARANANDH",
			"Nationality": "INDIAN",
			"Place Of Birth": "MADURAI, TAMIL NADU",
			"Address": "15/49,LAKSHMIPURAM CROSS STREET \n MUNICHALAI,MADURAI CITY \n PIN:625001,TAMIL NADU,INDIA",
		},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-IDCards",
		title: "Driving License",
		username: "TN64 20100000331",
		password: "",
		otherFields: {
			"Name": "SANKAR ANANDH T N",
			"S/D/W of": "NARENDRA T C R",
			"Address": "15/49 LAKSHMPURAM CROSS STREET \n MADURAI 625001",
			"Date Of Issue": "27/01/2010",
			"Valid Upto": "26/01/2030"
		},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "IRCTC",
		username: "TN_Sankar",
		password: "IrcSaAn@141191",
		otherFields: {
			"Mobile App Login PIN": "3928",
			"Login URL": "https://www.irctc.co.in"
		},
		sensititveKeys: [
			"Mobile App Login PIN",
		]
	},
	{
		folder: "Sankar-Personal-Others",
		title: "Hornet - RTO and RC",
		username: "",
		password: "",
		otherFields: {
			"Registered Number": "TN63P 8833",
			"Registered Upto": "11/06/2032",
			"O SNO": "1",
			"Chassis Number": "ME4KC23AEH8010621",
			"Engine Number": "KC23E84026626",
			"Name": "SANKAR ANANDH T N",
			"S/W/D OF": "NARENDRA T C R",
			"Address": "NO 49/15 LAKSHMIPURAM, CROSS LANE MUNICHALAI, MADURAI-625009",
			"Model": "CB HORNET 160 R CBS IV",
			"NO OF CYL": "1",
			"MFG DT": "5/2017",
			"FUEL": "PETROL",
			"CU CAP": "160",
			"WHEEL BASE": "1345",
			"UNLADEN WT": "142",
			"SEATING C": "2",
		},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "Apple ICloud",
		username: "tnsankaranandh@icloud.com",
		password: "SankarCS@123",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "TNSTC (SETC) - Bus",
		username: "tnsankaranandh@gmail.com",
		password: "Sankar@91",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "GitHub SankarPersonal",
		username: "tnsankaranandh@gmail.com",
		password: "GitSaAn@141191",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "Carta - CS Investment",
		username: "tnsankaranandh@gmail.com",
		password: "^$VN-s7bgZp2%_g",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "Indigo",
		username: "tnsankaranandh@gmail.com",
		password: "IndSaAn@141191",
		otherFields: {
			"BlueChip Number": "038226366",
		},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "Amazon",
		username: "9042495512",
		password: "AmaSaAn@141191",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "HP Gas Consumer Number",
		username: "649474",
		password: "",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "Heroku",
		username: "tnsankaranandh@gmail.com",
		password: "HerSaAn@14119191",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "Madurai Corporation",
		username: "9042495512",
		password: "Sankar@93",
		otherFields: {
			"Madurai Corporation Login URL": "https://tnurbanepay.tn.gov.in/LoginPage.aspx",
			"Connection number/Assessment nunber": "115/086/901380"
		},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "Gmail 1 - tnsankaranandh",
		username: "tnsankaranandh",
		password: "Sankar@91",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "Gmail 2 - anandh1991",
		username: "anandh1991",
		password: "Sankar@912	",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "Bitwarden",
		username: "tnsankaranandh@gmail.com",
		password: "rH+6/f9JhbCqMc!",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "AWS Skill Builder for Certifications",
		username: "tnsankaranandh@gmail.com",
		password: "*(M!Gx8BBP:VV!-",
		otherFields: {
			"AWS Skill Builder Login URL": "https://skillbuilder.aws/",
		},
		sensititveKeys: []
	},
	{
		folder: "Sankar-Personal-Others",
		title: "TN E-Sevai",
		username: "tnsankar91",
		password: "TNSankar@91",
		otherFields: {
			"TN E-Sevai Login URL": "https://www.tnesevai.tn.gov.in/	",
		},
		sensititveKeys: []
	},
	{
		folder: "Sankar-CS",
		title: "GitHub Sankar CS",
		username: "sankaranandh.narendran@contentstack.com",
		password: "SankarCS@123",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-CS",
		title: "Gmail",
		username: "sankaranandh.narendran@contentstack.com",
		password: "SankarCS@123",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-CS",
		title: "Lytics",
		username: "sankaranandh.narendran@contentstack.com",
		password: "LyticsSankarCS@123",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Sankar-CS",
		title: "HackerRank",
		username: "talent@contentstack.com",
		password: "Cshr@123",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Krishiv-School",
		title: "Campus Care App",
		username: "P3046I",
		password: "37DMTC",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Krishiv-IDCards",
		title: "Aadhaar Card Krishiv",
		username: "833736694762",
		password: "",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "CommonToOurFamily-Personal",
		title: "Additional Gmail 1",
		username: "kksv.media@gmail.com",
		password: "kksv@123",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "CommonToOurFamily-Personal",
		title: "Additional Gmail 2",
		username: "kksv.media1@gmail.com",
		password: "kksv@123",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Varshini-Personal-Others",
		title: "GitHub Varshini Personal",
		username: "varshu1628@gmail.com",
		password: "VishnuGH@1628",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Varshini-Personal-Others",
		title: "LinkedIn",
		username: "varshu1628@gmail.com",
		password: "Varshu@1628",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Varshini-Personal-IDCards",
		title: "E-NPS PRAN",
		username: "110199031640",
		password: "NPSViVa@1628",
		otherFields: {},
		sensititveKeys: []
	},
	{
		folder: "Varshini-Personal-IDCards",
		title: "PAN Card Varshini",
		username: "BEJPV6703B",
		password: "Krishiv@1610",
		otherFields: {
			"Income Tax Login URL": "https://eportal.incometax.gov.in/iec/foservices/#/login"
		},
		sensititveKeys: []
	},
	{
		folder: "Varshini-Personal-Financials",
		title: "LIC Policy - Krishan",
		username: "7305248826",
		password: "LicViVa@2898Sank",
		otherFields: {
			"LIC Policy Login": "https://ebiz.licindia.in/D2CPM/#Login",
		},
		sensititveKeys: []
	},
	{
		folder: "Varshini-Personal-Financials",
		title: "Indian Bank",
		username: "30408778859",
		password: "IndViVa@2898",
		otherFields: {
			"IFSC": "",
			"Savings Account Number": "7046096743",
			"Debit Card Number": "",
			"Debit Card Expiry": "",
			"Debit Card CVV": "",
			"Debit Card Name": "",
			"Debit Card PIN": "3928",
			"CIF Number / Customer ID": "30408778859",
			"Transaction Password": "IndViVa@2898Tran",
		},
		sensititveKeys: [
			"Transaction Password",
			"Debit Card PIN",
			"Debit Card CVV"
		]
	},
];

const uniqueFolderNames = [];
allItems.forEach(i => {
	if (uniqueFolderNames.indexOf(i.folder) === -1)
		uniqueFolderNames.push(i.folder);
});
console.log('uniqueFolderNames: ', uniqueFolderNames);
console.log('uniqueFolderNames Length: ', uniqueFolderNames.length);

const folderUidsByNames = {};
(async () => {
    await mongoose.connect("mongodb+srv://vercel-admin-user-687f6fab4933e866fca4e53f:JY6OjkH5WyeCh7Cw@personalsecrets.hcizn.mongodb.net/secrets-db?retryWrites=true&w=majority");
	const createFolders = async () => {
		for (var f = 0; f < uniqueFolderNames.length; f++) {
			const newFolderObject = new Folder({
		      name: uniqueFolderNames[f],
		    });
		    await newFolderObject.save();
		    console.log('newFolder: ', newFolderObject);
		    console.log('newFolder ID: ', newFolderObject._id);
		    console.log('newFolder ID stringified: ', newFolderObject._id.toString());
		    folderUidsByNames[uniqueFolderNames[f]] = newFolderObject._id;
		}
	};
	await createFolders();
	console.log('folderUidsByNames: ', folderUidsByNames);

	const createItems = async () => {
		for (var i = 0; i < allItems.length; i++) {
			const currentItem = allItems[i];
			const newItemObject = new Item({
				folderUid: folderUidsByNames[currentItem.folder],
				title: currentItem.title,
				username: currentItem.username,
				password: currentItem.password,
				otherFields: currentItem.otherFields,
				sensitiveKeys: currentItem.sensititveKeys,
			});
		    await newItemObject.save();
		    console.log(`Item ${currentItem.title} created! ${i+1} items created out of ${allItems.length} items.`);
		}
	};
	createItems();
})();