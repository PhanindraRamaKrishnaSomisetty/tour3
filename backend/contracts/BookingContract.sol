// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VillageStayBooking {
    struct Booking {
        string ipfsHash;
        uint256 amount;
        bool exists;
        uint256 timestamp;
    }
    
    struct Rating {
        uint8 rating;
        string reviewHash;
        uint256 timestamp;
        bool exists;
    }
    
    mapping(string => Booking) public bookings;
    mapping(string => Rating) public ratings;
    
    event BookingLogged(string indexed bookingId, string ipfsHash, uint256 amount);
    event RatingLogged(string indexed bookingId, uint8 rating, string reviewHash);
    
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function logBooking(
        string memory bookingId,
        string memory ipfsHash,
        uint256 amount
    ) external onlyOwner {
        require(!bookings[bookingId].exists, "Booking already exists");
        
        bookings[bookingId] = Booking({
            ipfsHash: ipfsHash,
            amount: amount,
            exists: true,
            timestamp: block.timestamp
        });
        
        emit BookingLogged(bookingId, ipfsHash, amount);
    }
    
    function logRating(
        string memory bookingId,
        uint8 rating,
        string memory reviewHash
    ) external onlyOwner {
        require(bookings[bookingId].exists, "Booking does not exist");
        require(rating >= 1 && rating <= 5, "Invalid rating");
        
        ratings[bookingId] = Rating({
            rating: rating,
            reviewHash: reviewHash,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit RatingLogged(bookingId, rating, reviewHash);
    }
    
    function getBooking(string memory bookingId) 
        external 
        view 
        returns (string memory, uint256, bool) 
    {
        Booking memory booking = bookings[bookingId];
        return (booking.ipfsHash, booking.amount, booking.exists);
    }
    
    function getRating(string memory bookingId)
        external
        view
        returns (uint8, string memory, bool)
    {
        Rating memory rating = ratings[bookingId];
        return (rating.rating, rating.reviewHash, rating.exists);
    }
}