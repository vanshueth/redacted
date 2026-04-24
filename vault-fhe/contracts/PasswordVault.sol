// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

contract PasswordVault {
    struct Entry {
        euint8[] ciphertext;
        string   username;
        string   notes;
    }

    mapping(address => string[])                 private _labels;
    mapping(address => mapping(string => Entry)) private _entries;

    function storePassword(
        string   calldata label,
        InEuint8[] calldata inputs,
        string   calldata username,
        string   calldata notes
    ) external {
        Entry storage e = _entries[msg.sender][label];

        if (e.ciphertext.length == 0) {
            _labels[msg.sender].push(label);
        } else {
            delete e.ciphertext;
        }

        for (uint256 i = 0; i < inputs.length; i++) {
            euint8 v = FHE.asEuint8(inputs[i]);
            FHE.allowSender(v);
            FHE.allowThis(v);
            e.ciphertext.push(v);
        }

        e.username = username;
        e.notes    = notes;
    }

    function getPassword(string calldata label)
        external
        view
        returns (euint8[] memory ciphertext, string memory username, string memory notes)
    {
        Entry storage e = _entries[msg.sender][label];
        return (e.ciphertext, e.username, e.notes);
    }

    function getAllLabels() external view returns (string[] memory) {
        return _labels[msg.sender];
    }

    function deletePassword(string calldata label) external {
        delete _entries[msg.sender][label];
        string[] storage arr = _labels[msg.sender];
        for (uint256 i = 0; i < arr.length; i++) {
            if (keccak256(bytes(arr[i])) == keccak256(bytes(label))) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                break;
            }
        }
    }
}
