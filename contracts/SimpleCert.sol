// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleCert {
    // Mapping hash sertifikat => timestamp dibuat
    mapping(string => uint256) public certificates;

    event CertificateMinted(string indexed certificateHash, uint256 timestamp);

    // Fungsi simpan hash
    function storeHash(string memory _hash) public {
        require(certificates[_hash] == 0, "Sertifikat sudah ada!");
        certificates[_hash] = block.timestamp;
        emit CertificateMinted(_hash, block.timestamp);
    }

    // Fungsi cek keaslian
    function verifyHash(string memory _hash) public view returns (bool, uint256) {
        if (certificates[_hash] != 0) {
            return (true, certificates[_hash]);
        }
        return (false, 0);
    }
}
