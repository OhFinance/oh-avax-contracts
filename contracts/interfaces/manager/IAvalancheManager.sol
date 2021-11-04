// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IAvalancheManager {
    function burner() external view returns (address);
    
    function burn() external;

    function setBurner(address _burner) external;
}
