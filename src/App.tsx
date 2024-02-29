import { useEffect, useRef, useState } from "react";
import { parseCIDR, IPv4 } from "ipaddr.js";

function App() {
	const [userInput, setUserInput] = useState("");
	const fetchController = useRef(new AbortController()); // AbortControllerのインスタンスを保持

	useEffect(() => {
		const fetchIP = async () => {
			try {
				const response = await fetch("https://api.ipify.org/?format=json", {
					signal: fetchController.current.signal,
				});
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				const data = await response.json();
				setUserInput(`${data.ip}/32`);
			} catch (error) {
				console.error("Error fetching IP:", error);
			}
		};

		fetchIP();
	}, []);

	const [ipAddress, setIPAddress] = useState("");
  const [subnet, setSubnet] = useState(0);
	const [subnetMask, setSubnetMask] = useState("");
	const [numAddress, setNumAddress] = useState(0);
	const [networkAddress, setNetworkAddress] = useState("");
	const [broadcastAddress, setBroadcastAddress] = useState("");

	useEffect(() => {
		try {
			const [ip, mask] = parseCIDR(userInput);
			setIPAddress(ip.toString());
      setSubnet(mask);
			setSubnetMask(IPv4.subnetMaskFromPrefixLength(mask).toString());
			setNumAddress(2 ** (32 - mask));
			setNetworkAddress(IPv4.networkAddressFromCIDR(userInput).toString());
			setBroadcastAddress(IPv4.broadcastAddressFromCIDR(userInput).toString());
		} catch (error) {
			// console.error(error);
			setIPAddress("");
			setSubnetMask("");
			setNumAddress(0);
			setNetworkAddress("");
			setBroadcastAddress("");
		}
	}, [userInput]);

	return (
		<div className="flex flex-col items-center">
			<h1>CIDR Range Tool</h1>
			<div className="flex space-x-2 my-2">
				<input
					type="text"
					className="border"
					value={userInput}
					onChange={(e) => {
            setUserInput(e.target.value);
            if (e.target.value !== "") {
              fetchController.current.abort();
            }
					}}
				/>
			</div>
			<table className="table-fixed">
				<thead>
					<tr>
						<th>Item</th>
						<th className="w-64">Value</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>CIDR</td>
						<td>{ipAddress && `${ipAddress}/${subnet}`}</td>
					</tr>
					<tr>
						<td>サブネット表記</td>
						<td>{ipAddress && `${ipAddress}/${subnetMask}`}</td>
					</tr>
					<tr>
						<td>IPアドレス範囲</td>
						<td>
							{networkAddress && `${networkAddress} - ${broadcastAddress}`}
						</td>
					</tr>
					<tr>
						<td>IPアドレス数</td>
						<td>{numAddress === 0 ? "" : numAddress}</td>
					</tr>
					<tr>
						<td>ネットワークIP</td>
						<td>{networkAddress}</td>
					</tr>
					<tr>
						<td>ブロードキャストIP</td>
						<td>{broadcastAddress}</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}

export default App;
