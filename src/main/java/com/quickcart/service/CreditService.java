package com.quickcart.service;

import com.quickcart.entity.CreditTransaction;
import com.quickcart.entity.User;
import com.quickcart.repository.CreditTransactionRepository;
import com.quickcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class CreditService {

    @Autowired
    private CreditTransactionRepository creditTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public CreditTransaction requestCredit(
            @org.springframework.lang.NonNull Long borrowerId,
            @org.springframework.lang.NonNull Long lenderId,
            @org.springframework.lang.NonNull BigDecimal amount) {
        User borrower = userRepository.findById(borrowerId).orElseThrow();
        User lender = userRepository.findById(lenderId).orElseThrow();

        CreditTransaction tx = new CreditTransaction();
        tx.setBorrower(borrower);
        tx.setLender(lender);
        tx.setAmount(amount);
        tx.setStatus("PENDING");
        tx.setDueDate(LocalDateTime.now().plusDays(30));

        return creditTransactionRepository.save(tx);
    }
}
