const {expect} = require("chai");
const { ethers } = require("hardhat");



const NAME = "TokenMaster";
const SYMBOL = "TM";

const OCCASION_NAME = "ETH Texas";
const OCCASION_COST = ethers.parseUnits('1','ether')
const OCASSION_MAX_TICKETS = 100;
const OCASSION_DATE = "April 27";
const OCASSION_TIME = "10:00AM CST";
const OCASSION_LOCATION = "Austin, TX";

describe('TokenMaster', () => {
    let tokenmaster;
    let deployer,buyer;

    beforeEach(async ()=>{
        [deployer,buyer] = await ethers.getSigners();
        const TokenMaster = await ethers.getContractFactory("TokenMaster");
         tokenmaster = await TokenMaster.deploy(NAME,SYMBOL);

        const transaction = await tokenmaster.connect(deployer).list(
            OCCASION_NAME,
            OCCASION_COST,
            OCASSION_MAX_TICKETS,
            OCASSION_DATE,
            OCASSION_TIME,
            OCASSION_LOCATION
         );
            await transaction.wait();
    })
    
    describe("Deployment",()=>{
        it("Sets the name",async()=>{
            let name = await tokenmaster.name();
            expect(name).to.equal(NAME);
        })

        it("Sets the symbol",async()=>{
            let symbol = await tokenmaster.symbol();
            expect(symbol).to.equal(SYMBOL);
        })

        it("Sets the owner",async()=>{
            let owner = await tokenmaster.owner();
            expect(owner).to.equal(deployer.address);
        })
    })

    describe("Occasions",()=>{
         it("Updates the ocassion count",async()=>{
            const totalOccasions = await tokenmaster.totalOccasions();
            expect(totalOccasions).to.be.equal(1);
         })

         it("Returns the ocassion attributes",async()=>{
            const ocassion = await tokenmaster.getOcassion(1);
            expect(ocassion.id).to.be.equal(1);
            expect(ocassion.name).to.equal(OCCASION_NAME);
            expect(ocassion.cost).to.equal(OCCASION_COST);
            expect(ocassion.maxTickets).to.equal(OCASSION_MAX_TICKETS);
            expect(ocassion.date).to.equal(OCASSION_DATE);
            expect(ocassion.time).to.equal(OCASSION_TIME);
            expect(ocassion.location).to.equal(OCASSION_LOCATION);
         })
    })

    describe("minting",()=>{
        const ID =1;
        const SEAT = 50;
        const AMOUNT  = ethers.parseUnits('1','ether');

        beforeEach(async()=>{
            const transaction = await tokenmaster.connect(buyer).mint(ID,SEAT,{value:AMOUNT});
            await transaction.wait();
        });

        it("Updates the ticket count", async () => {
            const ocassion = await tokenmaster.getOcassion(1); // use await here to get the returned promise
            expect(ocassion.tickets).to.be.equal(OCASSION_MAX_TICKETS - 1);
        });

        it("Updates the buying status",async()=>{
            const status = await tokenmaster.hasBought(ID,buyer.address);
            expect(status).to.be.equal(true);
        });

        it("Updates the seat taken",async()=>{
            const owner = await tokenmaster.seatTaken(ID,SEAT);
            expect(owner).to.be.equal(buyer.address);
        });

        it("Updates the seat status",async()=>{
            const owner = await tokenmaster.seatTaken(ID,SEAT);
            expect(owner).to.be.equal(buyer.address);
        });

        it("Updates overall seating status",async()=>{
            const seats  = await tokenmaster.getSeatsTaken(ID);
            expect(seats.length).to.equal(1);
            expect(seats[0]).to.equal(SEAT);
        })

        it("Updates the balance",async()=>{
            const balance = await ethers.provider.getBalance(tokenmaster);
            expect(balance).to.equal(AMOUNT);
        })
    })

    describe("Withdrawing", () => {
        const ID = 1
        const SEAT = 50
        const AMOUNT = ethers.parseUnits("1", 'ether')
        let balanceBefore
    
        beforeEach(async () => {
          balanceBefore = await ethers.provider.getBalance(deployer.address)
    
          let transaction = await tokenmaster.connect(buyer).mint(ID, SEAT, { value: AMOUNT })
          await transaction.wait()
    
          transaction = await tokenmaster.connect(deployer).withdraw()
          await transaction.wait()
        })
    
        it('Updates the owner balance', async () => {
          const balanceAfter = await ethers.provider.getBalance(deployer.address)
          expect(balanceAfter).to.be.greaterThan(balanceBefore)
        })
    
        it('Updates the contract balance', async () => {
          const balance = await ethers.provider.getBalance(tokenmaster);
          expect(balance).to.equal(0)
        })
      })
    

})