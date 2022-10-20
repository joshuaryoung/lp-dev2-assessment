# Skills Assessment: LP Bank

This is a skills assessment, with the goal of delivering a small, terminal-based banking application called LP Bank.

## Instructions

Deliver a system that fulfills the user stories below. Please send us your project as or including a git repository, and make regular commits as you work, to help us get a better understanding of your thought process. You won't be judged on any in-progress commits or mistakes along the way: development is discovery and never a clean, direct process! Only the final state of your work will be considered. You are free to create the system using whatever architecture, language(s), or tools you like, as long as you adhere to the following requirements:

- Do not use http/s in any part of your system.
- Assume each bank customer has $100 in their account to start.
- Run `./bank` to start the banking server


If you have any questions, don't hestiate to ask! Email: shane.kuester@logicalposition.com



# User Stories


### 1

I open two terminal windows ("Customer1" and "Customer2"), and run `./customer`. In both cases, I see a screen, with a command prompt at the bottom:

	The Bank is closed.

	LP Bank>

"closed" is in red text.

### 2

As a customer, while the bank is closed, I enter `Hello?` into the prompt. My screen displays:

	The Bank is closed.

	[ SYSTEM ] The bank is closed.

	LP Bank>



### 3

I open a third terminal ("Teller1"), run `./teller`. The screen displays:

	Good Morning.
	You are not serving any customers.
	You have 2 customers waiting in line.

	LP Bank>

The "Customer 1" terminal now displays:

	The Bank is open.
	You are the next customer to be served.

	LP Bank>

"open" is in green text.

The "Customer 2" terminal now displays:

	The Bank is open.
	There is 1 customer in line ahead of you.

	LP Bank>



### 4

As a customer, when the bank is open but I am not being served, anything I enter into the command prompt is answered with:

	[ SYSTEM ] You are not currently being served.


### 5

As a teller, I enter `next` into my command prompt. The screen displays:

	You are serving customer #1.
	You have 1 customer waiting in line.

	[ CHAT ]
	- (you) What can I help you with?

	[ CUSTOMER ACCOUNT ]
	Status: Active
	Balance: $100

	LP Bank>

The "Customer 1" terminal now displays:

	The Bank is open.
	Teller #1 is now serving you!

	[ TELLER ] What can I help you with?

	LP Bank>

The "Customer 2" terminal now displays:

	The Bank is open.
	You are the next customer to be served.

	LP Bank>


### 6

As a customer or teller, anything I enter into the command prompt will be sent as a chat message.

Example Teller screen:

	You are serving customer #1.
	You have 1 customer waiting in line.

	[ CHAT ]
	- (you)        What can I help you with?
	- (Customer 1) I like turtles
	- (you)        Thats...nice.

	[ CUSTOMER ACCOUNT ]
	Status: Active
	Balance: $100

	LP Bank>

Example Customer screen:

	The Bank is open.
	Teller #1 is now serving you!

	[ TELLER ] What can I help you with?
	[ YOU ]    I like turtles
	[ TELLER ] Thats...nice.

	LP Bank>

### 7

As a customer, when I enter `I'd like to withdraw $50` or `Please withdraw $50.00` or even `What does a person need to do to withdraw $50 around here?`, the teller screen displays:

	You are serving customer #1.
	You have 1 customer waiting in line.

	[ CHAT ]
	- (you)        What can I help you with?
	- (Customer 1) Please withdraw $50

	[ CUSTOMER ACCOUNT ]
	Status: Active
	Balance: $100

	[ TRANSACTION: WITHDRAWAL $50 ]
	Will overdraft: No
	Do you approve? (Yes/No)

	LP Bank>

The customer screen displays:

	The Bank is open.
	Teller #1 is now serving you!

	[ TELLER ] What can I help you with?
	[ YOU ]    Please withdraw $50
	[ TELLER ] Please wait while I review the transaction...

	LP Bank>


### 8
As a teller, when a transaction is pending approval, I enter `yes` and the transaction is approved.

The teller screen adds a private message to the chat log.

	You are serving customer #1.
	You have 1 customer waiting in line.

	[ CHAT ]
	- (you)        What can I help you with?
	- (Customer 1) Please withdraw $55
	- [ WITHDRAWAL MADE: $55 ]

	[ CUSTOMER ACCOUNT ]
	Status: Active
	Balance: $45

	LP Bank>

The customer screen displays the following:

	The Bank is open.
	Teller #1 is now serving you!

	[ TELLER ] What can I help you with?
	[ YOU ]    Please withdraw $55
	[ TELLER ] Please wait while I review the transaction...
	[ TELLER ] Your withdrawal is complete! Your new balance is $45

	LP Bank>

If the teller enters `no`, the transaction is denied. The teller receives a private message:

	[ WITHDRAWAL DENIED: $50 ]

The customer receives a message.

	[ TELLER ] Your withdrawal of $50 is denied, because we like your money.


### 9

As a customer, when I have a pending transaction, I cannot stat another one. If I attempt to do so, I receive a system message:

	[ SYSTEM ] You already have a transaction in progress. Please wait.

### 10

As a customer, at any time, if I attempt to withdraw more than I have in my account, I immediately receive a system message, and no teller approval is requested.

	[ SYSTEM ] You have insufficient funds. Funds available: $100


### 11

As a teller, if a customer attempts to over-draft the account, a private warning is inserted in the chat log. The transaction is automatically denied, and I am not prompted to approve.

	You are serving customer #1.
	You have 1 customer waiting in line.

	[ CHAT ]
	- (you)        What can I help you with?
	- (Customer 1) Please withdraw $5,000,000
	- [ WARNING: Denied overdraft. Attempted withdrawal: $5,000,000 ]

	[ CUSTOMER ACCOUNT ]
	Status: Active
	Balance: $100

	LP Bank>


### 12

As a teller, while serving a customer, when I enter `next` into the prompt, my screen displays:

	You are serving customer #2.
	You have 0 customers waiting in line.

	[ CHAT ]
	- (you)        What can I help you with?

	[ CUSTOMER ACCOUNT ]
	Status: Active
	Balance: $100

	LP Bank>

The screen of the former customer being served displays:

	The Bank is open.
	Your session has ended.

	[ TELLER ] What can I help you with?
	[ YOU ]    Please withdraw $55
	[ TELLER ] Please wait while I review the transaction...
	[ TELLER ] Your withdrawal is complete! Your new balance is $45
	[ TELLER ] Ok, you're done. Have a great day!

	[ DISCONNECTED ]

The customer should then be returns to their regular bash terminal.



### 13

As a teller, if enter `next` into the command prompt, and there are no customers waiting, my screen displays:

	You are not serving	any customers.
	You have 0 customers waiting in line.

	LP Bank>



### 14

As a customer, if all tellers disconnect while I am still waiting, my screen displays:

	The Bank is open.
	There are 3 customers in line ahead of you.

	[ SYSTEM ] There are currently no tellers available. Please wait.

	LP Bank>

This system message disappears as soon as a teller has connected.